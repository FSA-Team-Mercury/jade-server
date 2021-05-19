const Sequelize = require("sequelize");
const moment = require("moment");
moment().format();
const db = require("./database");

const multiPlayerChallenge = db.define("multiPlayerChallenge", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  startDate: {
    type: Sequelize.DATE,
    defaultValue: new Date(),
  },
  winCondition:{
    type: Sequelize.ENUM("GREATER_THAN", "LESS_THAN"),
    allowNull: false,
    defaultValue: "LESS_THAN"
  },
  winner:{
    type: Sequelize.INTEGER,
    allowNull: true
  },

  endDate: {
    type: Sequelize.DATE,
    // allowNull: false, //this causes the route to break, even when an end date is entered
  },
  completed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = multiPlayerChallenge
