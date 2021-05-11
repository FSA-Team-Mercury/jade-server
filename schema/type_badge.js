const graphql = require("graphql");
const { Badge } = require("../db");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
} = graphql;

const BadgeType = new GraphQLObjectType({
    name: "Badge",
    fields: () => ({
      id: { type: GraphQLID },
      user_id: { type: GraphQLInt}, 
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
      userId: { type: GraphQLInt },
      type: { type: GraphQLString },
    },
    resolve(parent, args) {
      let badge = Badge.create({
        userId: args.userId,
        type: args.type,
      });
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