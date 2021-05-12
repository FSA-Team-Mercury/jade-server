const Sequelize = require("sequelize");
const db = require("./database");

const Account = db.define("account", {
  auth_token: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.ENUM("checking", "savings"),
    defaultValue: "checking",
    allowNull: false,
  },
});

module.exports = Account;
