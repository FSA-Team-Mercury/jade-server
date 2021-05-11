const db = require("./database");
const Account = require("./account");
const Budget = require('./budget')
const Saving = require('./saving')
const User = require("./user");
const Badge = require("./badge");
const Challenge = require("./challenge");

//associations
User.hasMany(Account)
Account.belongsTo(User)

User.hasMany(Budget)
Budget.belongsTo(User)

User.hasOne(Saving)
Saving.belongsTo(User)

Badge.belongsTo(User);
User.hasMany(Badge);

Challenge.belongsTo(User);
User.hasMany(Challenge);



module.exports = {
  db,
  Account,
  Budget,
  Saving,
  User,
  Badge,
  Challenge,
};


