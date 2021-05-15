const router = require("express").Router();
const { Game,User, Friend, Badge } = require("../db");
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjIxMDg4ODE5fQ.IQu5ya4QxIjZ1EMkHxeVJRkfxo5gI2M6Kjm4Ahsq4V8"
const { Op } = require("sequelize");

router.get('/testing', async(req,res,next)=>{
     const user = await User.findByToken(token)//context.authorization);
      const userData =  await User.findAll({
      where:{
        id: user.id,
      },
      attributes: ['id', 'username'],
      include: [
        {
          attributes: ['id', 'username'],
          model: User, as:  'userFriends',
          through: {
            where: {
                userId: user.id,
                accepted: true
              },
            attributes: ['accepted', 'friendshipDate','createdAt'],
            },
          include: {
            model: Badge,
            attributes: ['type', 'imageUrl','createdAt'],
          },
        }
      ],

    });
    const userFriends = userData[0].userFriends
    res.send(userFriends)
})

router.get('/mfriends', async(req,res,next)=>{
  try{
      let friends = [1,5]
      const user = await User.findByToken(token)//context.authorization);
      // const {friends} = args
      async function getMutualFriends(friendId){
        let users =  await User.findAll({
          // looks for an id of a friend
          where:{
              id: friendId
            },
          attributes: ['id', 'username'],
          include: [
            {
              attributes: ['id', 'username'],
              model: User, as:  'userFriends',
              through: {
                  // looks to see in friends table if they have a friend that the curent user is not following

                attributes: ['accepted', 'userId'],
                }
            }
          ],

        });
        console.log('users-->', users)
        if (users[0]){
          return users[0].userFriends
        }
        return []
      }
      let mutualFriendsData = {}

      for (let i=0;i<friends.length;i++){
        let friendId = friends[i]
        const mutualFriends = await getMutualFriends(friendId)
        mutualFriendsData[friendId] = mutualFriends

      }
      let count = 0
      const potentialFriends = Object.keys(mutualFriendsData).reduce((accum,key)=> {
        let user = mutualFriendsData[key]
        if (count > 20){ // to many people
          return accum
        }
        count += 1
        console.log('curUser reducer-->\n',user)
        accum = accum.concat(user)
        return accum
      },[])
      // return potentialFriends // these are the pennding friends
      res.send(potentialFriends)
    }catch(err){
      console.log('error in friends\n', err)
    }
})
module.exports = router;
