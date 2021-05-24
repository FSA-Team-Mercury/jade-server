require("dotenv").config();
const { Account, User_Challenge } = require("../db");
const moment = require("moment");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.CLIENT_ID,
      "PLAID-SECRET": process.env.SANDBOX_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(configuration);

const getDateForPlaid = (date) => {
  return moment(date).format("YYYY-MM-DD");
};

const getUserTransactions = async (auth_token, startDate, endDate) => {
  const res = await plaidClient.transactionsGet({
    access_token: auth_token,
    start_date: getDateForPlaid(startDate),
    end_date: getDateForPlaid(endDate),
  });

  return res.data.transactions;
};

const getUserSpendings = (transactions, category) => {
  let total = 0;

  transactions.forEach((item) => {
    if (item.category[0] === category) {
      total += item.amount;
    }
  });

  return total;
};

// get an array of users in challenge
const updateAndCalculateChallenge = async ({
  friendIds,
  startDate,
  endDate,
  challengeId,
  category,
}) => {
  const userSpendings = {};
  for (let i = 0; i < friendIds.length; i++) {
    let userId = friendIds[i];

    const userAccount = await Account.findOne({
      where: {
        userId,
      },
    });

    // get transactions for user
    const transactions = await getUserTransactions(
      userAccount.auth_token,
      startDate,
      endDate
    );

    // need to round to second place
    const totalSpent = Math.floor(getUserSpendings(transactions, category));

    // Upade challenges with new spendings
    await User_Challenge.update(
      {
        currentAmout: totalSpent,
      },
      {
        where: {
          userId,
          multiPlayerChallengeId: challengeId,
        },
      }
    );
    userSpendings[userId] = totalSpent;
  }

  return userSpendings;
};

const calculateWinner = (users, targetAmount, winCondition) => {
  switch (winCondition) {
    case "LESS_THAN":
      let lessThanOrder = users.sort((a, b) => {
        return a.user_challenge.currentAmout - b.user_challenge.currentAmout;
      });
      // in order to be a valid win they have to spend the targetAmount at min
      return lessThanOrder[0].user_challenge.currentAmout <= targetAmount
        ? lessThanOrder
        : [];
    case "GREATER_THAN":
      let greaterThanOrder = users.sort((a, b) => {
        return b.user_challenge.currentAmout - a.user_challenge.currentAmout;
      });
      // in order to be a valid win they have to spend the targetAmount at min
      return greaterThanOrder[0].user_challenge.currentAmout >= targetAmount
        ? greaterThanOrder
        : [];
    default:
      return {
        error: "not proper winCondition",
      };
  }
};

exports.updateAndCalculateChallenge = updateAndCalculateChallenge;

exports.calculateWinner = calculateWinner;
