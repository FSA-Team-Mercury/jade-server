const Sequelize = require('sequelize')
const db = require('./database')

const Saving = db.define('saving', {
  amount: {
    type : Sequelize.INTEGER,
    allowNull: false
  },
  //obtaining from Plaid
  // current_ammount : {
  //   type: Sequelize.INTEGER,
  //   allowNull: false
  // },
  goal_date:{
    type: Sequelize.DATEONLY, 
    allowNull: false
  },
  met_goal: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
})

module.exports = Saving
