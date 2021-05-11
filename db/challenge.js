const Sequelize = require("sequelize");
const moment = require("moment");
moment().format();
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

Challenge.beforeCreate(challenge => {
  const end_date = moment(challenge.endDate).format("MM-DD-YYYY");
  challenge.endDate = String(end_date);

  const start_date = moment(challenge.startDate).format("MM-DD-YYYY");
  challenge.startDate = String(start_date);
});

module.exports = Challenge;
