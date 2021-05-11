const graphql = require("graphql");
const { User } = require("../db");
const { GraphQLObjectType, GraphQLString, GraphQLID } = graphql;

// TYPE
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    password: { type: GraphQLString },
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
    console.log("token -->", context.authorization);
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
};
