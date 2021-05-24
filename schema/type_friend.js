const graphql = require("graphql");
const { User, Friend } = require("../db");
const { Op } = require("sequelize");

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
    badges: { type: GraphQLList(FriendBadgeType) },
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
    badgeImage: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  }),
});

// finding pending friends
const FindPendingFriendsType = new GraphQLObjectType({
  name: "FindPendingFriendsType",
  fields: () => ({
    id: { type: GraphQLInt }, // maybe should be id
    username: { type: GraphQLString },
    profileImage: { type: GraphQLString },
  }),
});

// *********** //
//   Queries   //
// *********** //
// friends that have accepted your request
const friends = {
  type: new GraphQLList(FindFriendsType),
  async resolve(parent, args, context) {
    try {
      const user = await User.findByToken(context.authorization);
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
      const user = await User.findByToken(context.authorization);
      let pending = await User.findFriends(user.id, false); // find where accepted is false
      return pending;
    } catch (err) {
      console.log("error in friends\n", err);
    }
  },
};

const FriendSearchType = new GraphQLObjectType({
  name: "FriendSearchType",
  fields: () => ({
    result: { type: GraphQLList(SingleSearchType) },
    pendingFriends: { type: GraphQLList(SingleSearchType) },
    friends: { type: GraphQLList(SingleSearchType) },
    search: { type: GraphQLString },
  }),
});

const SingleSearchType = new GraphQLObjectType({
  name: "SingleSearchType",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    profileImage: { type: GraphQLString },
    friends: { type: GraphQLList(SingleSearchFriendsType) },
    relationship: { type: GraphQLString },
  }),
});

const SingleSearchFriendsType = new GraphQLObjectType({
  name: "SingleSearchFriendsType",
  fields: () => ({
    accepted: { type: GraphQLBoolean },
    friendshipDate: { type: GraphQLString },
  }),
});

const searchUsers = {
  type: FriendSearchType,
  args: {
    search: { type: GraphQLString },
  },
  async resolve(parent, args, context) {
    try {
      const { search } = args;
      const user = await User.findByToken(context.authorization);
      const searchResult = await User.findAll({
        where: {
          [Op.and]: [
            {
              id: {
                [Op.not]: user.id,
              },
            },
            {
              username: {
                [Op.like]: `%${search}%`,
              },
            },
          ],
        },
        attributes: ["id", "username", "profileImage"],
      });

      const friends = await User.findFriends(user.id, true);
      const pendingFriends = await User.findFriends(user.id, false);
      const relationship = {}; //"PENDING" || "FRIENDS" || "NOT_FRIENDS"
      friends.forEach((user) => {
        relationship[user.id] = "FRIENDS";
      });

      pendingFriends.forEach((user) => {
        relationship[user.id] = "PENDING";
      });

      friends.forEach((user) => {
        relationship[user.id] = "FRIENDS";
      });

      searchResult.forEach((user, index) => {
        if (user.id in relationship) {
          searchResult[index].relationship = relationship[user.id];
        } else {
          searchResult[index].relationship = "NOT_FRIENDS";
        }
      });

      return {
        result: searchResult,
      };
    } catch (err) {
      throw new Error("Error Searching users", err);
    }
  },
};

// *********** //
//  MUTATIONS  //
// *********** //

// follow a friend
const addFriend = {
  type: FriendType,
  args: {
    friendId: { type: GraphQLID },
  },
  async resolve(parent, args, context) {
    try {
      const { friendId } = args;
      const user = await User.findByToken(context.authorization);
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
      throw new Error("there was an error adding this friend", error);
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
      const user = await User.findByToken(context.authorization);
      
      let newFriend = await Friend.update(
        {
          accepted: true,
          friendshipDate: date,
        },
        {
          where: {
            userId: friendId,
            friendId: user.id,
          },
        }
      );
      return {
        id: user.Id,
        friendId,
        friendshipDate: date,
      };
    } catch (error) {
      throw new Error("ERROR accepting friendRequest\n", error);
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
      throw new Error("There was an error unfollowing this user", err);
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
