const graphql = require("graphql");
const { Budget, User } = require("../db");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} = graphql;

const BudgetType = new GraphQLObjectType({
  name: "Budget",
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
    const user = await User.findByToken(context.authorization);
    return Budget.findAll({
      where: {
        userId: user.id,
        category: args.category,
      },
    });
  },
};

// find all budgets
const budgets = {
  type: new GraphQLList(BudgetType),
  async resolve(parent, args, context) {
    const user = await User.findByToken(context.authorization);
    const budgets = await Budget.findAll({
      where: {
        userId: user.id,
      },
    });
    return budgets;
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
    const user = await User.findByToken(context.authorization);
    const existingBudget = await Budget.findAll({
      where: {
        userId: user.id,
        category: args.category,
        isCompleted: false,
      },
    });
    if (existingBudget.length) {
      throw new Error("Budget already exists");
    }

    const budget = await Budget.create({
      category: args.category,
      goalAmount: args.goalAmount * 100, //converting to pennies for backend
      currentAmount: args.currentAmount * 100,
    });
    await budget.setUser(user.id);
    return budget;
  },
};

//update budget
const updateBudget = {
  type: BudgetType,
  args: {
    id: { type: GraphQLID },
    goalAmount: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    const user = await User.findByToken(context.authorization);
    const budget = await Budget.findByPk(args.id);
    if (user.id === budget.userId) {
      budget.goalAmount = args.goalAmount * 100;
      await budget.save();
      return budget;
    }
  },
};

//delete budget
const deleteBudget = {
  type: BudgetType,
  args: {
    id: { type: GraphQLID },
  },
  async resolve(parent, args, context) {
    const user = await User.findByToken(context.authorization);
    const budget = await Budget.findOne({
      where: {
        id: args.id,
        userId: user.id,
      },
    });

    await budget.destroy();

    return budget;
  },
};

module.exports = {
  budget_queries: {
    budgetByCategory,
    budgets,
  },
  budget_mutations: {
    addBudget,
    deleteBudget,
    updateBudget,
  },
  BudgetType,
};
