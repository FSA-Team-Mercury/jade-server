const Sequelize = require("sequelize");
const moment = require("moment");
moment().format();
const db = require("./database");

const Friend = db.define("friends", {
  accepted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  friendshipDate: {
    type: Sequelize.STRING,
    allowNull: true
  },
});



module.exports = Friend;
