const express = require("express");
const router = express.Router();
const gamesController = require("../controllers/games.controller");
const usersModel = require("../models/users.model");
const loginActivityModel = require("../models/login.model");
// usersModel.requireAuth
router.get("/", loginActivityModel.authorization, gamesController.games);
router.post("/history", gamesController.history);
router.get("/waiting-room/:room", gamesController.waitingRoom);
router.get("/versus/:room", gamesController.versus);
router.post("/join", gamesController.join);
// router.get("/multiplier", gamesController.multiplier);
router.post("/player-one", gamesController.playerOne);
// router.get("/room", gamesController.room);
router.post("/player-two", gamesController.playerTwo);
router.get("/multiplier", loginActivityModel.authorization, gamesController.multiplier);
router.post("/multiplierpost", gamesController.multiplierPost);

module.exports = router;
