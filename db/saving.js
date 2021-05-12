const Sequelize = require('sequelize')
const db = require('./database')
const moment = require('moment');
moment().format();

const Saving = db.define('saving', {
  goalAmount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  //obtaining from Plaid
  currentAmount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  // by end of month
  endDate: {
    type: Sequelize.STRING,
    defaultValue: String(new Date()),
  },
  // just keep month
  startDate: {
    type: Sequelize.STRING,
    defaultValue: String(new Date()),
  },
  isCompleted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});


Saving.beforeCreate((saving) => {
  const endOfMonth = moment(saving.endDate).endOf('month');
  const endDate = moment(endOfMonth).format('MM-DD-YYYY');
  saving.endDate = String(endDate);
});

Saving.beforeCreate((saving) => {
  const startOfMonth = moment(saving.startDate).startOf('month');
  const startDate = moment(startOfMonth).format('MMMM');
  saving.startDate = String(startDate);
});

module.exports = Saving
