const graphql = require("graphql");
const { Badge, User } = require("../db");
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLList } =
  graphql;

const BadgeType = new GraphQLObjectType({
  name: "Badge",
  fields: () => ({
    id: { type: GraphQLID },
    user_id: { type: GraphQLInt },
    type: { type: GraphQLString },
  }),
});

//Queries
const userBadges = {
  type: new GraphQLList(BadgeType),
  args: { id: { type: GraphQLID } },
  resolve(parent, args) {
    return Badge.findAll({
      where: {
        userId: args.id,
      },
    });
  },
};

const badge = {
  type: BadgeType,
  args: { id: { type: GraphQLID } },
  resolve(parent, args) {
    // code to get data from source/db
    return Badge.findByPk(args.id);
  },
};

//Mutations
const addBadge = {
  type: BadgeType,
  args: {
    type: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    let badge = await Badge.create({
      type: args.type,
    });
    await badge.setUser(await User.findByToken(context.authorization)); //comment out for testing routes
    // await badge.setUser(await User.findByPk(1)) //this line used for testing routes
    return badge;
  },
};

module.exports = {
  badge_queries: {
    userBadges,
    badge,
  },
  badge_mutations: {
    addBadge,
  },
};
