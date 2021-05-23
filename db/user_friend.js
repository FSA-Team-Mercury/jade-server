const Sequelize = require("sequelize");
const moment = require("moment");
moment().format();
const db = require("./database");

const User_Friend = db.define("user_friend", {
  accepted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  }
});

module.exports = User_Friend;
