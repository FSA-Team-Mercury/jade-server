const graphql = require("graphql");
const Sequelize = require("sequelize"); //not needed?
const { Challenge } = require("../db");
const { UserType } = require("./type_user")
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} = graphql;

const ChallengeType = new GraphQLObjectType({
  name: "Challenge",
  fields: () => ({
    id: { type: GraphQLID },
    // user_id: { type: GraphQLInt },
    type: { type: GraphQLString },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString },
    completed: { type: GraphQLBoolean },
    user: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.userId);
      },
    },
  }),
});

//Queries
const userChallenges = {
  type: new GraphQLList(ChallengeType),
  // args: { id: { type: GraphQLID } },
  resolve(parent, args, context) {
    return Challenge.findAll({
      where: { userId: context.authorization, }, //use in final code
      // where: { userId: 1 } //this line used for testing route
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
    type: { type: GraphQLString },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    let challenge = await Challenge.create({
      type: args.type,
    });
    await challenge.setUser(await User.findByToken(context.authorization)) //use in final code
    // await challenge.setUser(await User.findByPk(1)); //this line used for testing routes
    return challenge;
  },
};

const completeChallenge = {
  type: ChallengeType,
  args: {
    id: { type: GraphQLID },
  },
  async resolve(parent, args, context) {
    let challenge = await Challenge.findByPk(args.id);
    challenge.completed = true;
    challenge.save();
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
    completeChallenge,
  },
};
