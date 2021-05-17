const db = require("./database");
const Account = require("./account");
const Budget = require("./budget");
const Saving = require("./saving");
const User = require("./user");
const Badge = require("./badge");
const Challenge = require("./challenge");
const Friend = require("./friends");

//associations
User.hasMany(Account);
Account.belongsTo(User);

User.hasMany(Budget);
Budget.belongsTo(User);

User.hasOne(Saving);
Saving.belongsTo(User);

Badge.belongsTo(User);
User.hasMany(Badge);

Challenge.belongsTo(User);
User.hasMany(Challenge);

// assosations -->>

// set friends
User.belongsToMany(User, { as: "userFriends", through: Friend,foreignKey: "userId", });

User.belongsToMany(User, {
  as: "friend",
  foreignKey: "friendId",
  through: Friend,
});
Friend.hasMany(User, {foreignKey:'friendId'})


module.exports = {
  db,
  Account,
  Budget,
  Saving,
  User,
  Badge,
  Challenge,
  Friend
};

User.findFriends = async (id, accepted)=>{
  let userData =  await User.findAll({
      where:{
        id,
      },
      attributes: ['id', 'username', 'profileImage'],
      include: [
        {
        model: User, as:  'friend',
        attributes: ['id', 'username', 'profileImage'],
         through:{
         attributes: ['accepted', 'friendshipDate', 'userId', 'friendId'],
          where:{
            accepted
          }
        },
        include: {
            model: Badge,
            attributes: ['type', 'imageUrl', 'createdAt'],
          },
      },
      {
        model: User, as:  'userFriends',
        attributes: ['id', 'username', 'profileImage',],
        through:{
          attributes: ['accepted', 'friendshipDate', 'userId', 'friendId'],
          where:{
            accepted
          }
        },
        include: {
            model: Badge,
            attributes: ['type', 'imageUrl', 'createdAt'],
          },
      }
      ]
    });
  let existingUser = []
  userData = userData[0]
  let users = userData.friend
  users = users.concat(userData.userFriends)
  users = users.filter(user=>{
    let existing = existingUser.includes(user.id)
    existingUser.push(user.id)
    return !existing
  })
  return users
}

