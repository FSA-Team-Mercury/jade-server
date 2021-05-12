const graphql = require("graphql");
const { User, Account, Challenge, Budget, Badge, Savings } = require("../db");
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } = graphql;
const { AccountType } = require("./type_account");
const { ChallengeType } = require("./type_challenge");
const { BadgeType } = require("./type_badge");
const { SavingType } = require("./type_saving");
const { BudgetType } = require("./type_budget");

// TYPE
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    accounts: {
      type: GraphQLList(AccountType),
      async resolve(parent) {
        const accounts = await Account.findAll({
          where: {
            userId: parent.id,
          },
        });
        return accounts;
      },
    },
    challenges: {
      type: GraphQLList(ChallengeType),
      async resolve(parent) {
        const challenges = await Challenge.findAll({
          where: {
            userId: parent.id,
          },
        });
        return challenges;
      },
    },
    badges: {
      type: GraphQLList(BadgeType),
      async resolve(parent) {
        const badges = await Badge.findAll({
          where: {
            userId: parent.id,
          },
        });
        return badges;
      },
    },
    savings: {
      type: GraphQLList(SavingType),
      async resolve(parent) {
        const savings = await Savings.findAll({
          where: {
            userId: parent.id,
          },
        });
        return savings;
      },
    },
    budgets: {
      type: GraphQLList(BudgetType),
      async resolve(parent) {
        const budgets = await Budget.findAll({
          where: {
            userId: parent.id,
          },
        });
        return budgets;
      },
    },
  }),
});

const AuthType = new GraphQLObjectType({
  name: "Auth",
  fields: () => ({
    token: { type: GraphQLString },
  }),
});
// QUERY
const user = {
  type: UserType,
  resolve(parent, args, context) {
    // code to get data from source/db
    return User.findByToken(context.authorization);
  },
};

// MUTATIONS
const logIn = {
  type: AuthType,
  args: {
    username: { type: GraphQLString },
    password: { type: GraphQLString },
  },
  async resolve(parent, args) {
    console.log(User.prototype);
    const token = await User.authenticate({
      username: args.username,
      password: args.password,
    });
    return { token };
  },
};

const signUp = {
  type: UserType,
  args: {
    username: { type: GraphQLString },
    password: { type: GraphQLString },
  },
  resolve(parent, args) {
    let user = User.create({
      username: args.username,
      password: args.password,
    });
    return user;
  },
};
module.exports = {
  user_queries: {
    user,
  },
  user_mutations: {
    logIn,
    signUp,
  },
  UserType,
};
