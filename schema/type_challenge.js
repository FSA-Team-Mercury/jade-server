const graphql = require("graphql");
const { Challenge , User } = require("../db");
// const { UserType } = require("./type_user")
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
    type: { type: GraphQLString },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString },
    completed: { type: GraphQLBoolean },
  }),
});

//Queries
const userChallenges = {
  type: new GraphQLList(ChallengeType),
  async resolve(parent, args, context) {
    const user = await User.findByToken(context.authorization)
    return Challenge.findAll({
      where: { userId: user.id, }, //use in final code
      // where: { userId: 1 } //this line used for testing route
    });
  },
};

const challenge = {
  type: ChallengeType,
  args: { id: { type: GraphQLID } },
  resolve(parent, args) {
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
  ChallengeType
};
