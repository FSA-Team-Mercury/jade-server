const Sequelize = require("sequelize");
const moment = require("moment");
moment().format();
const db = require("./database");

const User_Challenge = db.define("user_challenge", {
  currentAmout: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  leftChallenge:{
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }

});

module.exports = User_Challenge
