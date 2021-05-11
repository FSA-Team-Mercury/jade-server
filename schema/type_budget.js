const graphql = require('graphql');
const {Budget} = require ('../db')
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} = graphql;


const BudgetType = new GraphQLObjectType({
  name: 'Budget',
  fields: () => ({
    id: { type: GraphQLID },
    user_id: { type: GraphQLID },
    category: { type: GraphQLString },
    amount: { type: GraphQLInt },
    current_amount: { type: GraphQLInt },
    isCompleted: { type: GraphQLBoolean },
    created_at: { type: GraphQLString },
    end_date: { type: GraphQLString },
  }),
});

// QUERIES
//find all user budgets by type
const userBudgets = {
  type: new GraphQLList(BudgetType),
  args: { id: { type: GraphQLID }, category: { type: GraphQLString } },
  resolve(parent, args) {
    return Budget.findAll({
      where: {
        userId: args.id,
        category: args.category
      },
    });
  },
};

// find all user budgets
const allBudgets = {
  type: new GraphQLList(BudgetType),
  args:{id:{type: GraphQLID}},
  resolve(parent, args){
    return Budget.findAll()
  }
}


//MUTATIONS
const addBudget = {
  type: BudgetType,
  args: {
    user_id: { type: GraphQLInt },
    category: { type: GraphQLString },
    amount: { type: GraphQLInt },
    current_amount: { type: GraphQLInt },
    start_date: { type: GraphQLString },
    end_date: { type: GraphQLString },
    isCompleted: { type: GraphQLBoolean },
  },
};




module.exports = {
  budget_queries: {
    userBudgets,
    allBudgets
  },
  budget_mutations: {
    addBudget,
  },
};

