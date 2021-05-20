const router = require("express").Router();
const {User, multiPlayerChallenge} = require('../db')

router.get('/user/:id', async(req,res,next)=>{
  const id = req.params.id
  const challenges = await User.findOne({
    where: {
      id
    },
    include: [
      {
        model: multiPlayerChallenge,
        where:{
          completed: false
        },
        include: User,
      }
    ]
  })
  res.send(challenges || {})
})


router.post('/create/:friendId', async (req,res,next)=>{
  try {
    const user = await User.findByPk(1)
  const friendId = req.params.friendId
  // create a new challenge
  const newChallenge = await multiPlayerChallenge.create({
    name: 'big-spender',
    startDate: new Date(),
    winCondition: 'GREATER_THAN',
    endDate: new Date(),
    completed: false,
  })

  // get friend
  const friend = await User.findByPk(friendId)

  // add both to challenge
  await newChallenge.addUsers([friend,user])

  res.send(newChallenge)
  } catch (error) {
    console.log('error', error)
  }

})


module.exports = router;
