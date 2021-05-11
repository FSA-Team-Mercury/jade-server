const Sequelize = require ('sequelize')
const db = require('./database')
const moment = require('moment')
moment().format()

const Budget = db.define('budget', {
  category: {
    type: Sequelize.ENUM('groceries', 'entertainment', 'bills', 'other'),
    allowNull: false,
    defaultValue: 'other',
  },
  amount: {
    type: Sequelize.INTEGER,
    validate: {
      min: 0,
    },
    allowNull: false,
  },
  current_amount: {
    type: Sequelize.INTEGER,
    validate: {
      min: 0,
    },
    allowNull: false,
  },
  //! by end of month
  end_date: {
    type: Sequelize.DATEONLY, //? Sequelize.STRING
    get() {
      const startDate = moment(this.getDataValue('createdAt')).format('MM-DD-YYYY')
      return moment(startDate).endOf('month');
    },
    // allowNull: false,
  },
  isCompleted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Budget
