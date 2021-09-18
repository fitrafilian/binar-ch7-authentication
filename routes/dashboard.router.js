const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const usersModel = require("../models/users.model");
const dashboardModel = require("../models/dashboard.model");
const { authorization } = require("../models/login.model");
// const usersModel = { requireAuth: [] };

router.get("/", authorization, dashboardController.dashboard);
router.get("/users", authorization, dashboardController.users);
router.get("/activity", authorization, dashboardController.loginActivity);
router.get("/user/insert", authorization, dashboardController.insertUser);
router.post("/user/insert", usersModel.registerValidator, dashboardController.insertUserPost);
router.get("/user/:_id", authorization, dashboardController.details);
router.get("/user/update/:_id", authorization, dashboardController.update);
router.put("/user/update", dashboardModel.updateValidator, dashboardController.updatePut);
router.delete("/user", dashboardController.deleteUser);
router.get("/homepage", authorization, dashboardController.homepage);

module.exports = router;
