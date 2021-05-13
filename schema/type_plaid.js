require("dotenv").config();
const { User, Account } = require("../db");
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean,
} = require("graphql");

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.CLIENT_ID,
      "PLAID-SECRET": process.env.SANDBOX_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(configuration);

const BalancesType = new GraphQLObjectType({
  name: "Balances",
  fields: () => ({
    available: { type: GraphQLFloat },
    current: { type: GraphQLFloat },
    limit: { type: GraphQLFloat },
  }),
});
const InstitutionType = new GraphQLObjectType({
  name: "PlaidInst",
  fields: () => ({
    logo: { type: GraphQLString },
    name: { type: GraphQLString },
    url: { type: GraphQLString },
    primary_color: { type: GraphQLString },
  }),
});
const AccountType = new GraphQLObjectType({
  name: "PlaidAccount",
  fields: () => ({
    account_id: { type: GraphQLID },
    type: { type: GraphQLString },
    subtype: { type: GraphQLString },
    name: { type: GraphQLString },
    balances: { type: BalancesType },
    offical_name: { type: GraphQLString },
  }),
});

const TransactionTye = new GraphQLObjectType({
  name: "PlaidTransaction",
  fields: () => ({
    account_id: { type: GraphQLID },
    amount: { type: GraphQLFloat },
    category: { type: GraphQLString },
    date: { type: GraphQLInt },
    pending: { type: GraphQLBoolean },
    merchant_name: { type: GraphQLString },
  }),
});

const PlaidObjectType = new GraphQLObjectType({
  name: "PlaidObject",
  fields: () => ({
    accounts: { type: GraphQLList(AccountType) },
    transactions: { type: GraphQLList(TransactionTye) },
    total_transactions: { type: GraphQLInt },
    institution: { type: InstitutionType },
  }),
});

const TokenType = new GraphQLObjectType({
  name: "PlaidToken",
  fields: () => ({
    auth_token: { type: GraphQLString },
  }),
});

// QUERY
const plaid = {
  type: PlaidObjectType,
  async resolve(parent, args, context) {
    const user = await User.findByToken(context.authorization);
    const accts = await user.getAccounts();
    const res = await plaidClient.transactionsGet({
      access_token: accts[0].auth_token,
      start_date: "2021-03-01",
      end_date: "2021-05-01",
    });

    const insitutionID = res.data.item.institution_id;
    const request = {
      institution_id: insitutionID,
      country_codes: ["US", "GB"],
      options: {
        include_optional_metadata: true,
      },
    };

    const { data: inst_data } = await plaidClient.institutionsGetById(request);
    const { institution } = inst_data;

    return { ...res.data, institution };
  },
};

// MUTATION
const fetchPlaidToken = {
  type: TokenType,
  args: {
    public_token: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    const publicToken = args.public_token;
    const { data: access } = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = access.access_token;

    const user = await User.findByToken(context.authorization);
    const newAccount = await Account.create({
      auth_token: accessToken,
    });
    await user.addAccount(newAccount);
    return { auth_token: accessToken };
  },
};

// ******************************* //
// ******************************* //
// ******************************* //

module.exports = {
  plaid_queries: {
    plaid,
  },
  plaid_mutations: {
    fetchPlaidToken,
  },
};
