const db = require("./database");
const Account = require("./account");
const Budget = require("./budget");
const Saving = require("./saving");
const User = require("./user");
const Badge = require("./badge");
const Challenge = require("./challenge");
const Friend = require("./friends");

//associations
Badge.belongsTo(User);
User.hasMany(Badge);

User.belongsToMany(User, { as: "friendsByRequest", through: Friend,foreignKey: "userId", });

User.belongsToMany(User, {
  as: "friendsByInquire",
  foreignKey: "friendId",
  through: Friend,
});

// Friend.hasMany(User, {foreignKey:'friendId'})

User.hasMany(Account);
Account.belongsTo(User);

User.hasMany(Budget);
Budget.belongsTo(User);

User.hasOne(Saving);
Saving.belongsTo(User);

Challenge.belongsTo(User);
User.hasMany(Challenge);

// assosations -->>

// set friends



module.exports = {
  db,
  Account,
  Budget,
  Saving,
  User,
  Badge,
  Challenge,
  Friend,
};



