const Sequelize = require("sequelize");
const db = require("./database");

const Challenge = db.define("challenge", {
  type: {
    type: Sequelize.ENUM("big-saver", "big-spender"),
    allowNull: false,
  },
  startDate: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
  },
  endDate: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  completed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Challenge;