const graphql = require("graphql");
const { Challenge } = require("../db");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} = graphql;

const ChallengeType = new GraphQLObjectType({
    name: "Challenge",
    fields: () => ({
      id: { type: GraphQLID }, 
      user_id: { type: GraphQLInt}, 
      type: { type: GraphQLString },
      startDate: { type: GraphQLString },
      endDate: { type: GraphQLString }, 
      completed: { type: GraphQLBoolean },

    }),
  });

//Queries
const userChallenges = {
    type: new GraphQLList(ChallengeType),
    args: { id: { type: GraphQLID } },
    resolve(parent, args) {
        return Challenge.findAll({
        where: {
            userId: args.id,
        },
        });
    },
};

const challenge = {
    type: ChallengeType,
    args: { id: { type: GraphQLID } },
    resolve(parent, args) {
        // code to get data from source/db
        return Challenge.findByPk(args.id);
    },
};

//Mutations
const addChallenge = {
    type: ChallengeType,
    args: {
      userId: { type: GraphQLInt },
      type: { type: GraphQLString },
    },
    resolve(parent, args) {
      let challenge = Challenge.create({
        userId: args.userId,
        type: args.type,
      });
      return challenge;
    },
  };

  module.exports = {
    challenge_queries: {
      userChallenges,
      challenge,
    },
    challenge_mutations: {
      addChallenge,
    },
  };