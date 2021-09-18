const express = require("express");
const router = express.Router();
const pageController = require("../controllers/page.controller");
const usersModel = require("../models/users.model");
const loginActivityModel = require("../models/login.model");

// router.use(pageController.auth);
router.get("/", loginActivityModel.authorizationIndex, pageController.index);
// router.get("/games", usersModel.requireAuth, pageController.games);
// router.get("/token", pageController.token);
module.exports = router;
