const Sequelize = require("sequelize");
const moment = require("moment");
moment().format();
const db = require("./database");

const Friend = db.define("friends", {
  accepted: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  friendshipDate: {
    type: Sequelize.STRING,
    allowNull: true
  },
  createdAt:{
    type: Sequelize.STRING,
    defaultValue: JSON.stringify(new Date()),
    allowNull: false
  }
});



module.exports = Friend;



// Friend.acceptFriendReq = async function acceptFriendReq(user, newFriend){
//   try {

//     const friendShip = Friend.findOne({
//       where:{
//         userId: newFriend.id,
//       friendId: user.id,
//       }
//     })
//     if (!friendShip){
//       throw new Error('the user did not request a friendship')
//     }
//     await friendRequest.update({
//       accepted: true,
//       friendshipDate: JSON.stringify(new Date())
//     })
//     return true
//   } catch (error) {
//     console.log('error accepting friend', error)
//     return false
//   }
// }
