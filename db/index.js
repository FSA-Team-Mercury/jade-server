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
/*
User --has many friends ---> Friend
User -- can be friends of many users --> Friend


*/

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

User.findFriends = async (user)=>{
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
                accepted: true
              },
            attributes: ['accepted', 'friendshipDate'],
            },
          include: {
            model: Badge,
            attributes: ['type', 'imageUrl', 'createdAt'],
          },
        }
      ],

    });
    // console.log('findFriends-->', userData)
  return userData[0].userFriends
}

