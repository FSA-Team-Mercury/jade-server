const graphql = require("graphql");
const { User, Friend, Badge, Challenge } = require("../db");
const { Op } = require("sequelize");
const { UserType } = require("./type_user");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} = graphql;

const FriendType = new GraphQLObjectType({
  name: "Friend",
  fields: () => ({
    id: { type: GraphQLInt },
    username: { type: GraphQLString },
    friendId: { type: GraphQLID },
    profileImage: { type: GraphQLString },
    search: { type: GraphQLString },
  }),
});

// finding friends
const FindFriendsType = new GraphQLObjectType({
  name: "FindFriendsType",
  fields: () => ({
    id: { type: GraphQLInt }, // maybe should be id
    username: { type: GraphQLString },
    profileImage: { type: GraphQLString },
    friends: { type: GraphQLList(SingleFriendTableType) },
    badges: { type: GraphQLList(FriendBadgeType) },
  }),
});

const SingleFriendTableType = new GraphQLObjectType({
  name: "SingleFriendType",
  fields: () => ({
    accepted: { type: GraphQLBoolean },
    friendshipDate: { type: GraphQLString },
    userId: { type: GraphQLID },
    friendId: { type: GraphQLID },
  }),
});

const FriendBadgeType = new GraphQLObjectType({
  name: "FriendBadgeType",
  fields: () => ({
    type: { type: GraphQLString },
    imageUrl: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  }),
});

// finding pending friends
const FindPendingFriendsType = new GraphQLObjectType({
  name: "FindPendingFriendsType",
  fields: () => ({
    id: { type: GraphQLInt }, // maybe should be id
    username: { type: GraphQLString },
    friends: { type: SingleFriendTableType },
  }),
});

// search users in db friends
const SearchingUsersType = new GraphQLObjectType({
  name: "SearchingUsersType",
  fields: () => ({
    id: { type: GraphQLInt }, // maybe should be id
    username: { type: GraphQLString },
  }),
});

// Queries
// friends that have accepted your request
const friends = {
  type: new GraphQLList(FindFriendsType),
  async resolve(parent, args, context) {
    try {
      // const user = await User.findByToken(token); //context.authorization)//token);
      const user = await User.findOne({
        where:{
          id: 5
        }
      })
      const userFriends = await User.findFriends(user.id, true); // find where accepted is true
      return userFriends;
    } catch (err) {
      console.log("error in friends\n", err);
    }
  },
};

// find people that have not accepted the request
const pendingFriends = {
  type: new GraphQLList(FindPendingFriendsType),
  async resolve(parent, args, context) {
    try {
      const user = await User.findByToken(token); //context.authorization);
      const pending = await User.findFriends(user.id, false); // find where accepted is false
      return pending;
    } catch (err) {
      console.log("error in friends\n", err);
    }
  },
};

// find mutual friends
const MutualFriendsType = new GraphQLObjectType({
  name: "MutualFriendsType",
  fields: () => ({
    friend: { type: IntFriendType },
    mutualFriends: { type: GraphQLList(SingleMutualFriendType) },
  }),
});
const SingleMutualFriendType = new GraphQLObjectType({
  name: "SingleMutualFriendType",
  fields: () => ({}),
});
const IntFriendType = new GraphQLObjectType({
  name: "IntFriendType",
  fields: () => ({
    id: { type: GraphQLID },
  }),
});

const FriendSearchType = new GraphQLObjectType({
  name: "FriendSearchType",
  fields: () => ({
    result: { type: GraphQLList(SingleSearchType) },
    pendingFriends: {type: GraphQLList(SingleSearchType)},
    friends: {type: GraphQLList(SingleSearchType)},
    search: { type: GraphQLString },
  }),
});

const SingleSearchType = new GraphQLObjectType({
  name: "SingleSearchType",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    profileImage: { type: GraphQLString },
    profileImage: { type: GraphQLString },
    friends: {type: GraphQLList(SingleSearchFriendsType)}
  }),
});

const SingleSearchFriendsType = new GraphQLObjectType({
  name: 'SingleSearchFriendsType',
  fields: ()=>({
    accepted: {type: GraphQLBoolean},
    friendshipDate: {type: GraphQLString}
  })
})




const searchUsers = {
  type: FriendSearchType,
  args: {
    search: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      const { search } = args;
      const user = await User.findByToken(context.authorization);
      const users = await User.findAll({
        where: {
          username: {
            [Op.like]: `%${search}%`,
          },
        },
        attributes: ["id", "username", "profileImage"],
      });

      const friends = await User.findFriends(user.id, true)
      const pendingFriends = await User.findFriends(user.id, false)
      return {
        result: users,
        pendingFriends,
        friends
      };
    } catch (err) {
      console.log("error in friends\n", err);
      throw new Error("Error Searching users", error);
    }
  },
};

// MUTATION

// follow a friend
const addFriend = {
  type: FriendType,
  args: {
    friendId: { type: GraphQLID },
  },
  async resolve(parent, args, context) {
    try {
      const { friendId } = args;
      const user = await User.findByToken(context.authorization); //token)//context.authorization);
      const newFriend = await User.findOne({
        where: {
          id: friendId,
        },
      });

      user.addFriendsByRequest(newFriend);
      if (!newFriend.id) {
        throw new Error("User not on Jade");
      }
      return {
        friendId: newFriend.id,
      };
    } catch (error) {
      console.log("ERROR adding Friend\n", error);
      throw new Error("there was an error add this friend");
    }
  },
};

// accept a friend request
const acceptFriendReq = {
  type: FriendType,
  args: {
    friendId: { type: GraphQLID },
  },
  async resolve(parent, args, context) {
    try {
      const { friendId } = args;
      const date = JSON.stringify(new Date());
      const user = await User.findByToken(context.authorization); //murphyToken)//);

      const newFriend = await Friend.findOne({
        where: {
          userId: friendId,
          friendId: user.id,
        },
      });

      await newFriend.update({
        accepted: true,
        friendshipDate: date,
      });

      return {
        id: user.Id,
        friendId,
        friendshipDate: date,
      };
    } catch (error) {
      console.log("ERROR accepting friendRequest\n", error);
      throw new Error("there was an error accepting this follow");
    }
  },
};

// unfollow a friend
const unfollowUser = {
  type: FriendType,
  args: {
    friendId: { type: GraphQLID },
  },
  async resolve(parent, args, context) {
    try {
      const { friendId } = args;
      const user = await User.findByToken(context.authorization);
      const caseOne = await Friend.findOne({
        where: {
          friendId,
          userId: user.id,
        },
      });

      const caseTwo = await Friend.findOne({
        where: {
          userId: friendId,
          friendId: user.id,
        },
      });
      if (caseOne) {
        const deleted = await caseOne.destroy();
      } else if (caseTwo) {
        const deleted = await caseTwo.destroy();
      } else {
        throw new Error("do not follow this user");
      }
      return {
        id: user.Id,
        friendId,
      };
    } catch (err) {
      console.log("error in friends\n", err);
      throw new Error("There was an error unfollowing this user");
    }
  },
};

// RETURN
module.exports = {
  friend_queries: {
    friends,
    pendingFriends,
    searchUsers,
  },
  friend_mutations: {
    addFriend,
    acceptFriendReq,
    unfollowUser,
    searchUsers,
  },
  FriendType,
};
