const Sequelize = require("sequelize");
const db = require("./database");

const Badge = db.define("badge", {
  type: {
    type: Sequelize.ENUM("big-saver", "big-spender"),
    allowNull: false,
  },
});

module.exports = Badge;