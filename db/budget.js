const Sequelize = require("sequelize");
const db = require("./database");
const moment = require("moment");
moment().format();


const Budget = db.define('budget', {
  category: {
    type: Sequelize.ENUM(
      'Entertainment',
      'Other',
      'Food and Drink',
      'Shops',
      'Payment',
      'Travel',
      'Recreation'
    ),
    allowNull: false,
    defaultValue: 'Other',
  },
  goalAmount: {
    type: Sequelize.INTEGER,
    validate: {
      min: 0,
    },
    defaultValue: 0,
    allowNull: false,
  },
  // obtaining from Plaid
  currentAmount: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
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

Budget.beforeCreate((budget) => {

  const endOfMonth = moment(budget.endDate).endOf('month');
  const endDate = moment(endOfMonth).format('MM-DD-YYYY');
  budget.endDate = String(endDate);

});

Budget.beforeCreate((budget) => {
  const startOfMonth = moment(budget.startDate).startOf("month");
  const startDate = moment(startOfMonth).format("MMMM");
  budget.startDate = String(startDate);
});



module.exports = Budget;
