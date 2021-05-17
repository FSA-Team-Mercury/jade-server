const router = require("express").Router();
const { Game,User, Friend, Badge } = require("../db");
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjIxMDg4ODE5fQ.IQu5ya4QxIjZ1EMkHxeVJRkfxo5gI2M6Kjm4Ahsq4V8"
const { Op } = require("sequelize");

router.get('/old', async (req,res,next)=>{
  // const user = await User.findByToken(token)//context.authorization);
    // const {search} = args
    let search = 'd'
    const user = await User.findByToken(token)//context.authorization);
    const users = await User.findAll({
      where:{
        username: {
          [Op.like]: `%${search}%`
          }
      },
      attributes:['id', 'username', 'profileImage']
    })
    res.send(users)
})

router.get('/testing', async(req,res,next)=>{
     const user = await User.findByToken(token)//context.authorization);
     console.log(user.id)
      let userData =  await User.findAll({
      where:{
        id: user.id,
      },
      attributes: ['id', 'username', 'profileImage'],
      include: [
        {
        model: User, as:  'friend',
        attributes: ['id', 'username', 'profileImage'],
         through:{
          // attributes:[]
         attributes: ['accepted', 'friendshipDate', 'userId', 'friendId'],
          where:{
            accepted: true
          }
        },
        include: {
            model: Badge,
            attributes: ['type', 'imageUrl', 'createdAt'],
          },
      },
      {
        model: User, as:  'userFriends',
        attributes: ['id', 'username', 'profileImage',],
        through:{
          attributes: ['accepted', 'friendshipDate', 'userId', 'friendId'],
          where:{
            accepted: true
          }
        },
        include: {
            model: Badge,
            attributes: ['type', 'imageUrl', 'createdAt'],
          },
      }
      ]
    });
    userData = userData[0]
    let mutualFriends = userData.friend
    mutualFriends = mutualFriends.concat(userData.userFriends)
    res.send(mutualFriends)
    let data = {
      id: userData.id,
      username: userData.username,
      profileImage: userData.profileImage,
      mutualFriends
    }
    res.send(data)
    // res.send(userData)
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
          attributes: ['id', 'username',],
          include: [
            {
              attributes: ['id', 'username', 'profileImage'],
              model: User, as:  'userFriends',
                include: {
                  model: User, as:  'friend',
                  attributes: ['id', 'username', 'profileImage'],
                }

            }
          ],

        });
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
      console.log('error in friends api\n', err)
    }
})
module.exports = router;
