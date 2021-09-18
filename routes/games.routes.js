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

module.exports = router;
