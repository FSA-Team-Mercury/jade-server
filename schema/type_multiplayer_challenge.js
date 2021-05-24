const graphql = require("graphql");
const { User, multiPlayerChallenge, Badge } = require("../db");
const moment = require("moment");
const {
  updateAndCalculateChallenge,
  calculateWinner,
} = require("../func/updateChallenges");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} = graphql;

const MultiPlayerChallengeType = new GraphQLObjectType({
  name: "MultiPlayerChallengeType",
  fields: () => ({
    id: { type: GraphQLInt },
    username: { type: GraphQLString },
    friendId: { type: GraphQLID },
    profileImage: { type: GraphQLString },
    multiPlayerChallenges: { type: GraphQLList(multiPlayerChallengesType) },
  }),
});

const multiPlayerChallengesType = new GraphQLObjectType({
  name: "multiPlayerChallengesType",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    startDate: { type: GraphQLString },
    winCondition: { type: GraphQLString },
    winAmount: { type: GraphQLString },
    winner: { type: GraphQLID },
    endDate: { type: GraphQLString },
    completed: { type: GraphQLBoolean },
    category: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    badgeImage: { type: GraphQLString },
    user_challenge: { type: userChallengeType },
    users: { type: GraphQLList(usersType) },
  }),
});

const usersType = new GraphQLObjectType({
  name: "usersType",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    profileImage: { type: GraphQLString },
    notification_token: { type: GraphQLString },
    user_challenge: { type: userChallengeType },
  }),
});

const userChallengeType = new GraphQLObjectType({
  name: "userChallengeType",
  fields: () => ({
    currentAmout: { type: GraphQLInt },
    leftChallenge: { type: GraphQLBoolean },
  }),
});

// Queries

const allMultiPlayerChallenges = {
  type: MultiPlayerChallengeType,
  async resolve(parent, args, context) {
    try {
      const user = await User.findByToken(context.authorization);
      const challenges = await User.findOne({
        where: {
          id: user.id,
        },
        include: [
          {
            model: multiPlayerChallenge,
            include: User,
          },
        ],
      });
      return challenges;
    } catch (err) {
      throw new Error("Error finding all challenges", err);
    }
  },
};

const currentMultiPlayerChallenges = {
  type: MultiPlayerChallengeType,
  async resolve(parent, args, context) {
    try {
      const user = await User.findByToken(context.authorization);
      const challenges = await User.findOne({
        where: {
          id: user.id,
        },
        include: [
          {
            model: multiPlayerChallenge,
            where: {
              completed: false,
            },
            include: User,
          },
        ],
      });
      return challenges;
    } catch (err) {
      console.log("error in friends\n", err);
      throw new Error("error finding curent challenges");
    }
  },
};

// MUTATION

const updateChallenge = {
  type: multiPlayerChallengesType,
  args: {
    challengeId: { type: GraphQLID },
  },
  async resolve(parent, args, context) {
    const { challengeId } = args;
    let findWinner = false;
    try {
      const user = await User.findByToken(context.authorization);

      let challenge = await multiPlayerChallenge.findOne({
        where: {
          id: challengeId,
        },
        include: User,
      });

      const friendIds = challenge.users.reduce((accum, user) => {
        accum.push(user.id);
        return accum;
      }, []);

      const getStartDate = (date) => {
        return moment(date).format("YYYY-MM-DD");
      };

      const currentDate = new Date();
      if (
        currentDate >= Date.parse(challenge.endDate) &&
        !challenge.completed
      ) {
        // need to check if the task is marked complete
        if (challenge.completed) {
          return challenge;
        }
        // this challenge is done but has not been updated yet
        await multiPlayerChallenge.update(
          { completed: true },
          { where: { id: challengeId } }
        );
        findWinner = true;
        challenge.completed = true;
      }

      const args = {
        friendIds,
        winAmount: challenge.winAmount,
        startDate: getStartDate(challenge.startDate),
        endDate: Date.parse(challenge.endDate),
        challengeId: challenge.id,
        category: challenge.category,
      };

      const res = await updateAndCalculateChallenge(args);

      const newCalcs = challenge.users.map((user, index) => {
        user.user_challenge.currentAmout = res[user.id];
        if (1 === index) {
          user.user_challenge.currentAmout += res[user.id];
        }
        return user;
      });

      if (findWinner) {
        const targetAmount = challenge.winAmount / 100; // to dollars
        const winningOrder = calculateWinner(
          newCalcs,
          targetAmount,
          challenge.winCondition
        );
        if (winningOrder.length) {
          await multiPlayerChallenge.update(
            {
              winner: winningOrder[0].id,
            },
            {
              where: {
                id: challengeId,
              },
            }
          );
          challenge.winner = winningOrder[0].id;
          await Badge.create({
            type: challenge.name,
            badgeImage: challenge.badgeImage,
            userId: winningOrder[0].id,
            challengeId: challenge.id,
          });
        }
      }

      challenge.users = newCalcs;
      return challenge;
    } catch (error) {
      console.log("error in challenge-->", error);
      throw Error("error getting challenge");
    }
  },
};

// create user challenges
const createMultiplayerChallenge = {
  type: MultiPlayerChallengeType,
  args: {
    friendId: { type: GraphQLID },
    name: { type: GraphQLString },
    winCondition: { type: GraphQLString },
    endDate: { type: GraphQLString },
    category: { type: GraphQLString },
    winAmount: { type: GraphQLInt },
    badgeImage: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      const {
        friendId,
        name,
        endDate,
        winCondition,
        winAmount,
        category,
        badgeImage,
      } = args;
      const user = await User.findByToken(context.authorization);
      const newChallenge = await multiPlayerChallenge.create({
        name,
        winCondition,
        winAmount,
        endDate: endDate,
        category,
        badgeImage,
      });

      // add to databse with just user associated
      if (friendId === "0") {
        await newChallenge.addUsers([user]);
      } else {
        // for multi user challenges
        const friend = await User.findByPk(friendId);
        await newChallenge.addUsers([friend, user]);
      }

      const challenges = await User.findOne({
        where: {
          id: user.id,
        },
        include: [
          {
            model: multiPlayerChallenge,
            where: {
              id: newChallenge.id,
            },
            include: User,
          },
        ],
      });

      return challenges;
    } catch (err) {
      throw new Error("error creating challenge");
    }
  },
};

module.exports = {
  multiplayer_queries: {
    currentMultiPlayerChallenges,
    allMultiPlayerChallenges,
  },
  multiplayer_mutations: {
    createMultiplayerChallenge,
    updateChallenge,
  },
};
