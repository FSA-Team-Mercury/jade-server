const Sequelize = require("sequelize");
const db = require("./database");

const Badge = db.define("badge", {
  type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  badgeImage: {
    type: Sequelize.TEXT,
    defaultValue: "rainbow",
  },
  challengeId: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
});

module.exports = Badge;
