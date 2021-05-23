const graphql = require("graphql");
const { User, multiPlayerChallenge, User_Challenge } = require("../db");
const moment = require("moment");
const { Op } = require("sequelize");
const {
  updateAndCalculateChallenge,
  getWinningOrder,
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
    endDate: { type: GraphQLString },
    completed: { type: GraphQLBoolean },
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

const updateUsersChallenges = new GraphQLObjectType({
  name: "updateUsersChallenges",
  fields: () => ({
    multiPlayerChallengeId: { type: GraphQLID },
    updatedData: { type: MultiPlayerChallengeType },
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
    let id = 1;
    let findWinner = false;
    try {
      // const user = await User.findByToken(context.authorization)
      const user = await User.findByPk(2);

      const challenge = await multiPlayerChallenge.findOne({
        where: {
          id: challengeId,
        },
        include: User,
      });

      const friendIds = challenge.users.reduce((accum, user) => {
        accum.push(user.id);
        return accum;
      }, []);

      const beginnignOfMonth = moment(new Date())
        .startOf("month")
        .format("YYYY-MM-DD");

      const currentDate = new Date();
      if (currentDate >= challenge.endDate && !challenge.completed) {
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
      }

      const args = {
        friendIds,
        winAmount: challenge.winAmount,
        startDate: beginnignOfMonth,
        endDate: challenge.endDate,
        challengeId: challenge.id,
        category: "Recreation",
      };

      const resp = await updateAndCalculateChallenge(args);

      const newCalcs = challenge.users.map((user, index) => {
        user.user_challenge.currentAmout = resp[user.id];
        if (1 === index) {
          user.user_challenge.currentAmout += resp[user.id];
        }
        return user;
      });

      if (findWinner) {
        const winningOrder = getWinningOrder(newCalcs, challenge.winCondition);
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
    startDate: { type: GraphQLString },
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
        startDate,
        endDate,
        winCondition,
        winAmount,
        category,
        badgeImage,
      } = args;
      const user = await User.findByToken(context.authorization);
      // const user = await User.findByPk(2)

      // get friend
      const friend = await User.findByPk(friendId);
      if (!friend) {
        throw new Error("user does not exist");
      }
      const newChallenge = await multiPlayerChallenge.create({
        name,
        winCondition,
        winAmount,
        startDate: Date.parse(startDate),
        endDate: Date.parse(endDate),
        category,
        badgeImage,
      });

      // add both to challenge
      await newChallenge.addUsers([friend, user]);

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
      console.log("error in create multiplayer challenge\n", err);
      throw new Error("error create challenge");
    }
  },
};

// leave a challenge
const leaveChallenge = {
  type: MultiPlayerChallengeType,
  args: {
    challengeId: { type: GraphQLID },
  },
  async resolve(parent, args, context) {
    try {
      // const user = await User.findByToken(context.authorization);
      const user = await User.findByPk(1);
      const { challengeId } = args;

      const update = await User_Challenge.update(
        {
          leftChallenge: true,
        },
        {
          where: {
            userId: user.id,
            multiPlayerChallengeId: challengeId,
          },
        }
      );

      // if it didn't update it will be [0] else [1]
      if (!update[0]) {
        throw new Error("no such challenge in db");
      }

      return {
        id: user.id,
      };
    } catch (error) {
      console.log("error in leaving challenge==>", error);
      throw new Error("error leaving challenge");
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
    leaveChallenge,
  },
};
