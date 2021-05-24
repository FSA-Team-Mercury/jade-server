const router = require("express").Router();
require("dotenv").config();
const { User, multiPlayerChallenge } = require("../db");
const moment = require("moment");

const { updateAndCalculateChallenge } = require("../func/updateChallenges");

const getDateForPlaid = (date) => {
  return moment(date).format("YYYY-MM-DD");
};

router.get("/:id", async (req, res, next) => {
  const id = req.params.id;

  const challenge = await multiPlayerChallenge.findOne({
    where: {
      id,
    },
    include: User,
  });

  const friendIds = challenge.users.reduce((accum, user) => {
    accum.push(user.id);
    return accum;
  }, []);

  const beginnignOfMonth = moment(new Date())
    .startOf("month")
    .format("YYYY-MM-DD");

  const args = {
    friendIds,
    winAmount: challenge.winAmount,
    startDate: beginnignOfMonth,
    endDate: getDateForPlaid(challenge.endDate),
    challengeId: challenge.id,
    category: "Recreation",
  };

  const resp = await updateAndCalculateChallenge(args);

  const newCalcs = challenge.users.map((user, index) => {
    user.user_challenge.currentAmout = resp[user.id];
    if (1 === index) {
      user.user_challenge.currentAmout += resp[user.id];
    }
    return user;
  });

  res.send(challenge);
});

module.exports = router;
