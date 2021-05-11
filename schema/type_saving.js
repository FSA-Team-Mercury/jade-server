const graphql = require('graphql');
const { Saving, User } = require('../db');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} = graphql;

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
  async resolve (parent, context){
    // const user = await User.findByToken("")
    const user = await User.findByPk(1); //temp
    return Saving.findOne({
      where: {
        userId: user.id
      },
    });
  }
};

//MUTATIONS
// create saving
const addSaving = {
  type: SavingType,
  args:{
    goalAmount: {type:GraphQLInt},
    currentAmount: {type:GraphQLInt}
  },
  async resolve (parent, args){
    const saving = await Saving.create({
      goalAmount: args.goalAmount * 100,
      currentAmount: args.currentAmount,
    });
    // await saving.setUser(await User.findByToken(""))
    await saving.setUser(await User.findByPk(1)); //temp

    return saving;
  }
}

// update saving
const updateSaving = {
  type: SavingType,
  args: {
    id: { type: GraphQLInt },
    goalAmount: { type: GraphQLInt },
  },
  async resolve(parent, args) {
    const saving = await Saving.findByPk(args.id);
    saving.goalAmount = args.goalAmount * 100;

    await saving.save();
    return saving;
  },
};


// delete saving
const deleteSaving = {
  type: SavingType,
  args: {
    id: { type: GraphQLInt },
  },
  async resolve(parent, args) {
    const saving = await Saving.findByPk(args.id);
    await saving.destroy();

    return true; //? possible return something else
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
