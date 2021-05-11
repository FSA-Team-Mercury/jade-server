const router = require("express").Router();
const { Game } = require("../db");

// GET /games
router.get("/", async (req, res, next) => {
  try {
    const games = await Game.findAll();
    res.status(200).send(games);
  } catch (error) {
    next(error);
  }
});

// POST /games
router.post("/", async (req, res, next) => {
  try {
    const game = await Game.create(req.body);
    res.status(200).send(game);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
