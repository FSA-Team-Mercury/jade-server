const Sequelize = require("sequelize");
require("dotenv").config();

const config = {
  logging: false,
};

if (process.env.DATABASE_URL && !process.env.DEV_ENV) {
  config.dialectOptions = {
    logging: false,
    ssl: {
      rejectUnauthorized: false,
    },
  };
}
const db = new Sequelize(process.env.DATABASE_URL, config);

module.exports = db;
