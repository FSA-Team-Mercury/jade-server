const graphql = require("graphql");
const { User, Friend,Badge,Challenge } = require("../db");
const { Op } = require("sequelize");
const {UserType} = require('./type_user')
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjIxMDg4ODE5fQ.IQu5ya4QxIjZ1EMkHxeVJRkfxo5gI2M6Kjm4Ahsq4V8"
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
    id: {type: GraphQLInt},
    username: {type: GraphQLString},
    friendId: {type: GraphQLInt},
    search: {type: GraphQLString}
  })
});

// finding friends
const FindFriendsType = new GraphQLObjectType({
  name: "FindFriendsType",
  fields: () => ({
    id: { type: GraphQLInt }, // maybe should be id
    username: { type: GraphQLString },
    friends: { type: SingleFriendTableType },
    badges: {type: GraphQLList(FriendBadgeType)}
  })
});

const SingleFriendTableType = new GraphQLObjectType({
  name: "SingleFriendType",
  fields: () => ({
    accepted: {type: GraphQLBoolean},
    friendshipDate: {type: GraphQLString},
  })
});

const FriendBadgeType = new GraphQLObjectType({
  name: 'FriendBadgeType',
  fields: ()=>({
    type: {type: GraphQLString},
    imageUrl: {type: GraphQLString},
    createdAt: {type: GraphQLString}
  })
})

// finding pending friends
const FindPendingFriendsType = new GraphQLObjectType({
  name: "FindPendingFriendsType",
  fields: () => ({
    id: { type: GraphQLInt }, // maybe should be id
    username: { type: GraphQLString },
    friends: { type: SingleFriendTableType },
  })
});

// search users in db friends
const SearchingUsersType = new GraphQLObjectType({
  name: "SearchingUsersType",
  fields: () => ({
    id: { type: GraphQLInt }, // maybe should be id
    username: { type: GraphQLString },
  })
});



// Queries

// friends that have accepted your request
const friends = {
  type: new GraphQLList(FindFriendsType),
  async resolve(parent, args, context) {
    try{
      const user = await User.findByToken(token)//context.authorization);
      const userFriends = await User.findFriends(user)
      console.log('friends-->\n', userFriends)
      return userFriends

    }catch(err){
      console.log('error in friends\n', err)
    }
  },
};

// find people that have not accepted the request
const pendingFriends = {
  type: new GraphQLList(FindPendingFriendsType),
  async resolve(parent, args, context) {
    try{
      const user = await User.findByToken(token)//context.authorization);
      const userData =  await User.findAll({
          where:{
            id: user.id,
          },
          attributes: ['id', 'username'],
          include: [
            {
              attributes: ['id', 'username'],
              model: User, as:  'userFriends',
              through: {
                where: {
                    userId: user.id,
                    accepted: false
                  },
                attributes: ['accepted'],
                }
            }
          ],

        });
        console.log(userData[0].userFriends)
        return userData[0].userFriends // these are the pennding friends

    }catch(err){
      console.log('error in friends\n', err)
    }
  },
};


// find mutual friends
const MutualFriendsType = new GraphQLObjectType({
  name:'MutualFriendsType',
  fields:()=>({
    friend: {type: IntFriendType},
    mutualFriends: {type: GraphQLList(SingleMutualFriendType)}
  })
})
const SingleMutualFriendType = new GraphQLObjectType({
  name:'SingleMutualFriendType',
  fields:()=>({

  })
})
const IntFriendType = new GraphQLObjectType({
  name: 'IntFriendType',
  fields:()=>({
    id: {type: GraphQLID}
  })
})
const mutualFriends = {
  type: new GraphQLList(MutualFriendsType),
  args:{
    friends: {type: GraphQLList(IntFriendType)}
  },
  async resolve(parent, args, context) {
    try{
      friends = [1,2,3,4,5]
      const user = await User.findByToken(token)//context.authorization);
      const {friends} = args

      async function getMutualFriends(friendId){
        return await User.findAll({
          // looks for an id of a friend
          where:{
              id: friendId
            },
          attributes: ['id', 'username'],
          include: [
            {
              attributes: ['id', 'username'],
              model: User, as:  'userFriends',
              through: {
                  // looks to see in friends table if they have a friend that the curent user is not following
                where: {
                    userId: friendId,
                    accepted: false // means user is not already following them
                  },
                attributes: ['accepted', 'userId'],
                }
            }
          ],

        })[0].userFriends;
      }
      let mutualFriendsData = {}

      for (let i=0;i<friends.length;i++){
        let friendId = friends[i]
        const mutualFriends = getMutualFriends(friendId)
        mutualFriendsData[friendId] = mutualFriends

      }
      let count = 0
      const potentialFriends = Object.keys(mutualFriendsData).filter((accum,key)=> {
        let user = mutualFriendsData[key]
        if (count > 20){ // to many people
          return accum
        }
        count += 1
        accum.push(user)
        return accum
      },[])
      return potentialFriends // these are the pennding friends

    }catch(err){
      console.log('error in friends\n', err)
    }
  },
};

// search users in db
const searchUsers = {
  type: FriendType,
  args: {
    search: {type: GraphQLString}
  },
  async resolve(parent, args, context) {
    try{
      const {search} = args
      const user = await User.findByToken(token)//context.authorization);
      const users = await User.findAll({
        where:{
          username: {
            [Op.like]: `%${search}%`
            }
        }
      })
      return users[0]
    }catch(err){
      console.log('error in friends\n', err)
      throw new Error('Error Searching users', error)
    }
  },
};


// MUTATION

// follow a friend
const addFriend = {
  type: FriendType,
  args: {
    friendId: { type: GraphQLInt },
  },
  async resolve(parent, args, context) {
    try {
      console.log('here')
      const {friendId} = args
      const user = await User.findByToken(token)//context.authorization);
      const newFriend = await User.findOne({
        where:{
          id: friendId
        }
      })
      if (!newFriend.id){
        throw new Error('User not on Jade')
      }
      await newFriend.setFriend(user)
      return {
        friendId
      }

    } catch (error) {
      console.log('ERROR adding Friend\n',error)
      throw new Error('there was an error add this friend')
    }
  },
};

// accept a friend request
const acceptFriendReq = {
  type: FriendType,
  args:{
    friendId: {type: GraphQLInt}
  },
  async resolve(parent,args,context){
    try {
      const {friendId} = args
      const date = JSON.stringify(new Date())
      const user = await  User.findByToken(token)//context.authorization);
      const newFriend = await Friend.update({
        accepted: true,
        friendshipDate: date,
      },{
        where: {
          userId: user.id,
          friendId
        }
      } )
      return {
        id: user.Id,
        friendId,
        friendshipDate: date
      }
    } catch (error) {
      console.log('ERROR accepting friendRequest\n',error)
      throw new Error('there was an error accepting this follow')
    }
  }
}

// unfollow a friend
const unfollowUser = {
  type: FriendType,
  args: {
    friendId: {type: GraphQLInt}
  },
  async resolve(parent, args, context) {
    try{
      const {friendId} = args
      const user = await User.findByToken(token)//context.authorization);
      await Friend.destroy({
        where:{
          friendId,
          userId: user.id
        }
      })

      return {
        id: user.Id,
        friendId
      }
    }catch(err){
      console.log('error in friends\n', err)
      throw new Error('There was an error unfollowing this user')
    }
  },
};


// RETURN
module.exports = {
  friend_queries: {
    friends,
    pendingFriends,
    searchUsers
  },
  friend_mutations: {
    addFriend,
    acceptFriendReq,
    unfollowUser,
    searchUsers
  },
  FriendType,
};
