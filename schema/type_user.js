const graphql = require("graphql");
const { User, Account, Challenge, Budget, Badge } = require("../db");
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } = graphql;
const { AccountType } = require("./type_account");
const { ChallengeType } = require("./type_challenge");
const { BadgeType } = require("./type_badge");

const { BudgetType } = require("./type_budget");

// TYPE
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    profileImage: { type: GraphQLString },
    notification_token: { type: GraphQLString },
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
  async resolve(parent, args, context) {
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
    const token = await User.authenticate({
      username: args.username,
      password: args.password,
    });
    return { token };
  },
};

const signUp = {
  type: AuthType,
  args: {
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    profileImage: { type: GraphQLString },
  },
  async resolve(parent, args) {
    const user = await User.findOne({
      where: { username: args.username },
    });

    if (user) {
      throw new Error("This user already exists");
    }
    await User.create({
      username: args.username,
      password: args.password,
      profileImage: args.profileImage,
    });
    const token = await User.authenticate({
      username: args.username,
      password: args.password,
    });
    return { token };
  },
};

const addPushToken = {
  type: BudgetType,
  args: {
    token: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      const user = await User.findByToken(context.authorization);
      user.notification_token = args.token;
      await user.save();
      return user;
    } catch (err) {
      throw new Error(err);
    }
  },
};

const updateProfilePic = {
  type: UserType,
  args: {
    id: { type: GraphQLID },
    profileImage: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      const user = await User.findByToken(context.authorization);
      user.profileImage = args.profileImage;
      await user.save();
      return user;
    } catch (err) {
      throw new Error(err);
    }
  },
};

module.exports = {
  user_queries: {
    user,
  },
  user_mutations: {
    logIn,
    signUp,
    addPushToken,
    updateProfilePic,
  },
  UserType,
};
