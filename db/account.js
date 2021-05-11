const Sequelize = require("sequelize");
const db = require("./database");

const Account = db.define("account", {
  auth_token: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.ENUM("checking", "savings"),
    allowNull: false,
  },
});

module.exports = Account;
