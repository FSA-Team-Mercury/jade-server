const graphql = require("graphql");
const { acc_queries, acc_mutations } = require("./type_account");
const {budget_queries, budget_mutations} = require('./type_budget')
const {savings_queries} = require('./type_saving')
const { badge_queries, badge_mutations } = require("./type_badge");
const { challenge_queries, challenge_mutations } = require("./type_challenge");
const { user_queries, user_mutations } = require("./type_user");

const { GraphQLObjectType, GraphQLSchema } = graphql;

// GET
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    ...acc_queries,
    ...budget_queries,
    ...badge_queries,
    ...challenge_queries,
    ...user_queries,
    ...savings_queries
  },
});


// POST / PUT / DELETE
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...acc_mutations,
    ...budget_mutations,
    ...badge_mutations,
    ...challenge_mutations,
    ...user_mutations,
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
