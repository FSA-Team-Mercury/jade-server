const graphql = require("graphql");
const { User, multiPlayerChallenge, User_Challenge } = require("../db");
const { Op } = require("sequelize");

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
    // createdAt: {type: GraphQLString},
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
      console.log("error in friends\n", err);
      throw new Error("error find all challenges");
    }
  },
};

const currentMultiPlayerChallenges = {
  type: MultiPlayerChallengeType,
  async resolve(parent, args, context) {
    try {
      const user = await User.findByToken(context.authorization);
      // const user = await User.findByPk(1);
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

// get user challenges

const createMultiplayerChallenge = {
  type: MultiPlayerChallengeType,
  args: {
    friendId: { type: GraphQLID },
    name: { type: GraphQLString },
    startDate: { type: GraphQLString },
    winCondition: { type: GraphQLString },
    endDate: { type: GraphQLString },
    winAmount: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      const { friendId, name, startDate, endDate, winCondition,winAmount } = args;
      const user = await User.findByToken(context.authorization);
      // const user = await User.findByPk(1);

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
      });
      console.log('friendId-->', friend.id, 'userId--->', user.id)
      // add both to challenge
      await newChallenge.addUsers([friend, user]);

      return {
        id: user.id,
        friendId,
      };
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
      const user = await User.findByToken(context.authorization);
      // const user = await User.findByPk(1);
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
    leaveChallenge,
  },
};
