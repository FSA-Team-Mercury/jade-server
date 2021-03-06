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
  winCondition: {
    type: Sequelize.ENUM("GREATER_THAN", "LESS_THAN"),
    allowNull: false,
    defaultValue: "LESS_THAN",
  },
  winner: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  winAmount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  category:{
    type: Sequelize.STRING,
    allowNull: false
  },
  endDate: {
    type: Sequelize.STRING,
    // allowNull: false, //this causes the route to break, even when an end date is entered
  },
  badgeImage:{
    type: Sequelize.STRING,
    allowNull: false,
  },
  completed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = multiPlayerChallenge;


