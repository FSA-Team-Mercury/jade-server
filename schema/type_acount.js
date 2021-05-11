const graphql = require("graphql");
const { Account } = require("../db");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
} = graphql;

const AccountType = new GraphQLObjectType({
  name: "Account",
  fields: () => ({
    id: { type: GraphQLID },
    auth_token: { type: GraphQLString },
    type: { type: GraphQLString },
    user_id: { type: GraphQLInt },
  }),
});

// QUERY
const userAccounts = {
  type: new GraphQLList(AccountType),
  args: { id: { type: GraphQLID } },
  resolve(parent, args) {
    return Account.findAll({
      where: {
        userId: args.id,
      },
    });
  },
};

const accounts = {
  type: new GraphQLList(AccountType),
  resolve() {
    return Account.findAll();
  },
};

const account = {
  type: AccountType,
  args: { id: { type: GraphQLID } },
  resolve(parent, args) {
    // code to get data from source/db
    return Account.findByPk(args.id);
  },
};

// MUTATIONS
const addAccount = {
  type: AccountType,
  args: {
    auth_token: { type: GraphQLString },
    type: { type: GraphQLString },
  },
  resolve(parent, args) {
    let account = Account.create({
      auth_token: args.auth_token,
      type: args.type,
    });
    return account;
  },
};

module.exports = {
  acc_queries: {
    accounts,
    userAccounts,
    account,
  },
  acc_mutations: {
    addAccount,
  },
};
