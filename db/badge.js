const Sequelize = require("sequelize");
const db = require("./database");

const Badge = db.define("badge", {
  type: {
    type: Sequelize.ENUM("big-saver", "big-spender", "traveler", "hermit", "smart-shopper"),
    allowNull: false,
  },
  imageUrl: {
    type: Sequelize.TEXT,
    defaultValue: 'https://www.pngkit.com/png/full/201-2012600_image-result-for-pokemon-red-and-blue-logo.png',
  }
});

module.exports = Badge;