const Sequelize = require("sequelize");
const db = require("./database");

const Badge = db.define("badge", {
  type: {
    // type: Sequelize.ENUM(
    //   "big-saver",
    //   "big-spender",
    //   "traveler",
    //   "hermit",
    //   "smart-shopper"
    // ),
    type: Sequelize.STRING,
    allowNull: false,
  },
  badgeImage: {
    type: Sequelize.TEXT,
    defaultValue: "rainbow",
  },
});

module.exports = Badge;
