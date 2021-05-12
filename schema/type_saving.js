const graphql = require('graphql');
const { Saving, User } = require('../db');
const { GraphQLObjectType, GraphQLID, GraphQLInt, GraphQLBoolean } = graphql;

const TEST_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjIwNzg1ODU4fQ.vuV-tHzLjx8WEJZ6AB0c3oMat978pbK1831uIu1X9GU';

const SavingType = new GraphQLObjectType({
  name: 'Savings',
  fields: () => ({
    id: { type: GraphQLID },
    userId: { type: GraphQLID },
    goalAmount: { type: GraphQLInt },
    currentAmount: { type: GraphQLInt },
    isCompleted: { type: GraphQLBoolean },
  }),
});

//QUERIES
// finding user savings
const allSavings = {
  type: SavingType,
  async resolve(parent, context) {
    const user = await User.findByToken(context.authorization);
    return Saving.findOne({
      where: {
        userId: user.id,
      },
    });
  },
};

//MUTATIONS
// create saving
const addSaving = {
  type: SavingType,
  args: {
    goalAmount: { type: GraphQLInt },
    currentAmount: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    const user = await User.findByToken(context.authorization);

    const saving = await Saving.create({
      goalAmount: args.goalAmount * 100,
      currentAmount: args.currentAmount,
    });
    await saving.setUser(user.id);
    return saving;
  },
};

// update saving
const updateSaving = {
  type: SavingType,
  args: {
    id: { type: GraphQLInt },
    goalAmount: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    const user = await User.findByToken(context.authorization);
    const saving = await Saving.findByPk(args.id);
    if (user.id === saving.userId) {
      saving.goalAmount = args.goalAmount * 100;
      await saving.save();
      return saving;
    }
  },
};

// delete saving
const deleteSaving = {
  type: SavingType,
  args: {
    id: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    const user = await User.findByToken(context.authorization);
    const saving = await Saving.findByPk(args.id);
    if (user.id === saving.userId) {
      const saving = await Saving.findByPk(args.id);
      await saving.destroy();
      return saving;
    }
  },
};

module.exports = {
  saving_queries: {
    allSavings,
  },
  saving_mutations: {
    addSaving,
    updateSaving,
    deleteSaving,
  },
};
