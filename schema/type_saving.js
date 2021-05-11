const graphql = require('graphql');
const { Saving } = require('../db');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} = graphql;

const SavingsType = new GraphQLObjectType({
  name: 'Savings',
  fields: () => ({
    user_id: { type: GraphQLID },
    amount: { type: GraphQLInt },
    // current_amount: { type: GraphQLInt },
    goal_date: { type: GraphQLString },
    met_goal: { type: GraphQLBoolean },
  }),
});

//QUERY
// finding user savings
const userSavings = {
  type: new GraphQLList(SavingsType),
  args: {id: {type:GraphQLID}},
  resolve (parent, args){
    return Saving.findAll({
      where: {
        userId: args.id,
      },
    });
  }
};

module.exports = {
  savings_queries: {
    userSavings
  },
};
