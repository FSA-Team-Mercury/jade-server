const Sequelize = require("sequelize");
const moment = require("moment");
moment().format();
const db = require("./database");

const Challenge = db.define("challenge", {
  type: {
    type: Sequelize.ENUM("big-saver", "big-spender", "hermit", "traveler", "smart-shopper"),
    allowNull: false,
  },
  startDate: {
    type: Sequelize.STRING,
    defaultValue: String(new Date()),
  },
  endDate: {
    type: Sequelize.STRING,
    // allowNull: false, //this causes the route to break, even when an end date is entered
  },
  completed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

Challenge.beforeCreate((challenge) => {
  const end_date = moment(challenge.endDate).format("MM-DD-YYYY");
  challenge.endDate = String(end_date);

  console.log('end-date--------->', end_date);
  console.log('challenge', challenge)

  const start_date = moment(challenge.startDate).format("MM-DD-YYYY");
  challenge.startDate = String(start_date);
});

module.exports = Challenge;
