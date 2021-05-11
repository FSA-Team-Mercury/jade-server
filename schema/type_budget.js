const graphql = require('graphql');
const { Budget, User } = require('../db');
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
    userId: { type: GraphQLID },
    category: { type: GraphQLString },
    goalAmount: { type: GraphQLInt },
    currentAmount: { type: GraphQLInt },
    isCompleted: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    endDate: { type: GraphQLString },
  }),
});

//QUERIES
// find all budgets by category
const budgetByCategory = {
  type: new GraphQLList(BudgetType),
  args: { category: { type: GraphQLString } },
  async resolve(parent, args, context) {
    // const user = await User.findByToken("")
    const user = await User.findByPk(1); //temp
    return Budget.findAll({
      where: {
        userId: user.id,
        category: args.category,
      },
    });
  },
};

// find all budgets
const allBudgets = {
  type: new GraphQLList(BudgetType),
  async resolve(parent, context) {
    // const user = await User.findByToken("")
    const user = await User.findByPk(1); //temp
    return Budget.findAll({
      where: {
        userId: user.id
      },
    });
  },
};

//MUTATIONS
// create budget
const addBudget = {
  type: BudgetType,
  args: {
    category: { type: GraphQLString },
    goalAmount: { type: GraphQLInt },
    currentAmount: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    const budget = await Budget.create({
      category: args.category,
      goalAmount: args.goalAmount * 100, //converting to pennies for backend
      currentAmount: args.currentAmount,
    });
    // await budget.setUser(await User.findByToken(""))
    await budget.setUser(await User.findByPk(1)); //temp

    return budget;
  },
};

//update budget
const updateBudget = {
  type: BudgetType,
  args: {
    id: { type: GraphQLInt },
    category: { type: GraphQLString },
    goalAmount: { type: GraphQLInt },
  },
  async resolve(parent, args) {
    const budget = await Budget.findByPk(args.id);
    budget.category = args.category
    budget.goalAmount = args.goalAmount * 100

    await budget.save();
    return budget;
  },
};

//delete budget
const deleteBudget = {
  type: BudgetType,
  args: {
    id: { type: GraphQLInt },
  },
  async resolve(parent, args) {
    const budget = await Budget.findByPk(args.id);
    await budget.destroy();

    return true //? possible return something else
  },
};



//? delete all budgets


module.exports = {
  budget_queries: {
    budgetByCategory,
    allBudgets,
  },
  budget_mutations: {
    addBudget,
    deleteBudget,
    updateBudget,
  },
};
