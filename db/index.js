const db = require("./database");
const Account = require("./account");
const Budget = require("./budget");
const User = require("./user");
const Badge = require("./badge");
const Challenge = require("./challenge");
const Friend = require("./friends");
const multiPlayerChallenge = require("./multiPlayerChallenge");
const User_Challenge = require("./user_challenge");

//associations
Badge.belongsTo(User);
User.hasMany(Badge);

User.belongsToMany(User, {
  as: "friendsByRequest",
  through: Friend,
  foreignKey: "userId",
});

User.belongsToMany(User, {
  as: "friendsByInquire",
  foreignKey: "friendId",
  through: Friend,
});

multiPlayerChallenge.belongsToMany(User, { through: User_Challenge });
User.belongsToMany(multiPlayerChallenge, { through: User_Challenge });

Badge.belongsTo(multiPlayerChallenge,{as:"challenge",foreignKey: 'challengeId'})

// User.hasMany(multiPlayerChallenge)

// multiPlayerChallenge.belongsToMany(User, {as: 'ChallengeAccepter',through:multiPlayerChallenge, foreignKey: 'friendId'})

User.hasMany(Account);
Account.belongsTo(User);

User.hasMany(Budget);
Budget.belongsTo(User);



Challenge.belongsTo(User);
User.hasMany(Challenge);



module.exports = {
  db,
  Account,
  Budget,
  User,
  Badge,
  Challenge,
  Friend,
  multiPlayerChallenge,
  User_Challenge,
};
