const Sequelize = require("sequelize");
require("dotenv").config();

const config = {
  logging: false,
};

// if (process.env.LOGGING === "true") {
//   delete config.logging;
// }

// if (process.env.DATABASE_URL) {
//   config.dialectOptions = {
//     logging: false,
//     ssl: {
//       rejectUnauthorized: false,
//     },
//   };
// }
const db = new Sequelize('postgres://localhost/jade', config);

module.exports = db;
