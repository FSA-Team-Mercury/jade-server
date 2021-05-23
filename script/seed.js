const moment = require("moment");
moment().format();
const {
  db,
  User,
  Badge,
  Challenge,
  Budget,
  Friend,
  Account,
} = require("../db");
require("dotenv").config();
async function acceptFriendReq(user, newFriend) {
  try {
    const acceptedFriends = await Friend.update(
      {
        accepted: true,
        friendshipDate: JSON.stringify(new Date()),
      },
      {
        where: {
          userId: newFriend.id,
          friendId: user.id,
        },
      }
    );
    if (!acceptedFriends[0]) {
      throw new Error("new friend did not request a friendship");
    }
  } catch (error) {
    console.log("ERROR ACCEPTING FRIEND", error);
  }
}

async function seed() {
  await db.sync({ force: true }); // clears db and matches models to tables
  console.log("db synced!");
  // Creating Users
  const users = await Promise.all([
    User.create({
      username: "cody",
      password: "12345",
      profileImage: "bad-bunny",
    }),
    User.create({
      username: "murphy",
      password: "12345",
      profileImage: "ozil",
    }),
    User.create({
      username: "geza",
      password: "12345",
      profileImage: "salah",
    }),
    User.create({
      username: "alan",
      password: "12345",
      profileImage: "robo",
    }),
    User.create({
      username: "dnice",
      password: "12345",
      profileImage: "rihanna",
    }),
    User.create({
      username: "dylan",
      password: "12345",
      profileImage: "bad-bunny",
    }),
  ]);

  const acct = await Account.create({
    auth_token: process.env.DEFAULT_PLAID,
  });
  await users[0].addAccount(acct);

  const challenges = await Promise.all([
    Challenge.create({
      type: "big-saver",
      endDate: "2021-05-31 06:00:00",
      completed: false,
    }),
    Challenge.create({
      type: "big-spender",
      endDate: "2021-07-31 06:00:00",
      completed: false,
    }),
  ]);

  await challenges[0].setUser(users[1]);
  await challenges[0].setUser(users[0]);
  await challenges[1].setUser(users[2]);
  await challenges[0].setUser(users[3]);
  await challenges[0].setUser(users[4]);
  await challenges[1].setUser(users[5]);

  const badges = await Promise.all([
    Badge.create({
      type: "big-saver",
      badgeImage: "rainbow",
    }),
    Badge.create({
      type: "traveler",
      badgeImage: "earth",
    }),
    Badge.create({
      type: "hermit",
      badgeImage: "soul",
    }),
    Badge.create({
      type: "smart-shopper",
      badgeImage: "marsh",
    }),
    Badge.create({
      type: "big-spender",
      badgeImage: "boulder",
    }),
    Badge.create({
      type: "big-saver",
      badgeImage: "rainbow",
    }),
    Badge.create({
      type: "traveler",
      badgeImage: "earth",
    }),
    Badge.create({
      type: "hermit",
      badgeImage: "soul",
    }),
    Badge.create({
      type: "smart-shopper",
      badgeImage: "marsh",
    }),
    Badge.create({
      type: "big-spender",
      badgeImage: "boulder",
    }),
    Badge.create({
      type: "big-saver",
      badgeImage: "rainbow",
    }),
    Badge.create({
      type: "traveler",
      badgeImage: "earth",
    }),
    Badge.create({
      type: "hermit",
      badgeImage: "soul",
    }),
    Badge.create({
      type: "smart-shopper",
      badgeImage: "marsh",
    }),
    Badge.create({
      type: "big-spender",
      badgeImage: "boulder",
    }),
  ]);

  await users[0].addBadge(badges[0]);
  await users[0].addBadge(badges[1]);
  await users[0].addBadge(badges[2]);
  await users[0].addBadge(badges[3]);
  await users[5].addBadge(badges[4]);

  await users[1].addBadge(badges[5]);
  await users[1].addBadge(badges[6]);
  await users[1].addBadge(badges[7]);
  await users[2].addBadge(badges[8]);
  await users[2].addBadge(badges[9]);

  await users[3].addBadge(badges[10]);
  await users[3].addBadge(badges[11]);
  await users[4].addBadge(badges[12]);
  await users[4].addBadge(badges[13]);
  await users[5].addBadge(badges[14]);



  const budgets = await Promise.all([
    Budget.create({
      category: "Food and Drink",
      goalAmount: 20000,
      currentAmount: 1000,
    }),
    Budget.create({
      category: "Payment",
      goalAmount: 5000,
      currentAmount: 3000,
    }),
    Budget.create({
      category: "Entertainment",
      goalAmount: 50000,
      currentAmount: 60000,
    }),
    Budget.create({
      category: "Other",
      goalAmount: 2200,
      currentAmount: 800,
    }),
    Budget.create({
      category: "Shops",
      goalAmount: 2200,
      currentAmount: 800,
    }),
    Budget.create({
      category: "Travel",
      goalAmount: 2500,
      currentAmount: 900,
    }),
    Budget.create({
      category: "Entertainment",
      goalAmount: 4000,
      currentAmount: 7000,
    }),
  ]);

  await budgets[0].setUser(users[0]);
  await budgets[1].setUser(users[0]);
  await budgets[2].setUser(users[1]);
  await budgets[3].setUser(users[1]);
  await budgets[4].setUser(users[0]);
  await budgets[5].setUser(users[1]);
  await budgets[6].setUser(users[0]);

  await budgets[1].setUser(users[3]);
  await budgets[2].setUser(users[4]);
  await budgets[3].setUser(users[5]);

  await users[0].addFriendsByRequest(users[1]);
  await acceptFriendReq(users[1], users[0]);

  await users[0].addFriendsByRequest(users[2]);
  await acceptFriendReq(users[2], users[0]);

  await users[0].addFriendsByRequest(users[3]);
  await acceptFriendReq(users[3], users[0]);

  await users[2].addFriendsByRequest(users[3]);
  await acceptFriendReq(users[3], users[2]);

  await users[4].addFriendsByRequest(users[5]);
  await acceptFriendReq(users[5], users[4]);

  return {
    users: {
      cody: users[0],
      murphy: users[1],
    },
  };
}

/*
 We've separated the `seed` function from the `runSeed` function.
 This way we can isolate the error handling and exit trapping.
 The `seed` function is concerned only with modifying the database.
*/
async function runSeed() {
  console.log("seeding...");
  try {
    await seed();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    console.log("closing db connection");
    await db.close();
    console.log("db connection closed");
  }
}

/*
  Execute the `seed` function, IF we ran this module directly (`node seed`).
  `Async` functions always return a promise, so we can use `catch` to handle
  any errors that might occur inside of `seed`.
*/
if (module === require.main) {
  runSeed();
}

// we export the seed function for testing purposes (see `./seed.spec.js`)
module.exports = seed;
