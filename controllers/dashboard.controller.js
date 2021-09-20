const mongoose = require("mongoose");
const usersModel = require("../models/users.model");
const biodataModel = require("../models/biodata.model");
const historyModel = require("../models/history.model");
const loginActivityModel = require("../models/login.model");
const versusModel = require("../models/versus.model");
const usersController = require("../controllers/users.controller");
const { body, validationResult, check } = require("express-validator");
let dataTokens = usersController.dataTokens;

module.exports = {
  dashboard: (req, res) => {
    res.render("dashboard/dashboard", {
      title: "Dashboard",
      layout: "dashboard/layouts/dashboard-layout",
      activeDashboard: "linkActive",
    });
  },

  users: async (req, res) => {
    let users = await usersModel.User.find();
    res.render("dashboard/users", {
      title: "Users Master",
      layout: "dashboard/layouts/dashboard-layout",
      users: users,
      activeUsers: "linkActive",
      message: req.flash("message"),
    });
  },

  loginActivity: async (req, res) => {
    let online = await loginActivityModel.LoginActivity.find();
    res.render("dashboard/online", {
      title: "Users Master",
      layout: "dashboard/layouts/dashboard-layout",
      users: online,
      activeOnline: "linkActive",
    });
  },

  details: async (req, res) => {
    let user = await usersModel.User.findOne({
      _id: mongoose.Types.ObjectId(req.params._id),
      // _id: req.params._id,
    });
    let biodata = await biodataModel.Biodata.findOne({ uid: req.params._id });
    let histories = await historyModel.History.find({ uid: req.params._id });
    let versusHistories1 = await versusModel.Versus.find({ playerOne: req.params._id });
    let versusHistories2 = await versusModel.Versus.find({ playerTwo: req.params._id });
    let Versus = [];
    versusHistories1.forEach((v) => {
      if (v.playerOne && v.playerTwo && v.playerOneScore !== undefined && v.playerTwoScore !== undefined) {
        let result;
        if (v.playerOneScore > v.playerTwoScore) {
          result = "Win";
        } else if (v.playerOneScore < v.playerTwoScore) {
          result = "Lose";
        } else {
          result = "Draw";
        }
        Versus.push({
          date: v.date,
          player: v.playerOneScore,
          enemy: v.playerTwoScore,
          result: result,
        });
      }
    });
    versusHistories2.forEach((v) => {
      if (v.playerOne && v.playerTwo && v.playerOneScore !== undefined && v.playerTwoScore !== undefined) {
        let result;
        if (v.playerOneScore < v.playerTwoScore) {
          result = "Win";
        } else if (v.playerOneScore > v.playerTwoScore) {
          result = "Lose";
        } else {
          result = "Draw";
        }
        Versus.push({
          date: v.date,
          player: v.playerTwoScore,
          enemy: v.playerOneScore,
          result: result,
        });
      }
    });
    res.render("dashboard/details", {
      layout: "dashboard/layouts/dashboard-layout",
      title: user.firstName + " " + user.lastName,
      user: user,
      biodata: biodata,
      histories: histories,
      versus: Versus,
    });
  },

  insertUser: (req, res) => {
    res.render("dashboard/insert", {
      title: "Insert user",
      layout: "dashboard/layouts/dashboard-layout",
    });
  },

  insertUserPost: async (req, res) => {
    const errors = validationResult(req);
    const { email, firstName, lastName, password, confirmPassword } = req.body;
    const hashedPassword = await usersModel.getHashedPassword(password);
    if (!errors.isEmpty()) {
      res.render("dashboard/insert", {
        layout: "dashboard/layouts/dashboard-layout",
        title: "Insert user",
        errors: errors.array(),
      });
    } else {
      await usersModel.User.insertMany(
        {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
        (err, result) => {
          req.flash("message", "User successfully made");
          res.redirect("/dashboard/users");
        }
      );
    }
  },

  update: async (req, res) => {
    let user = await usersModel.User.findOne({
      _id: mongoose.Types.ObjectId(req.params._id),
    });

    res.render("dashboard/update", {
      title: "Update user",
      layout: "dashboard/layouts/dashboard-layout",
      user: user,
    });
  },

  updatePut: async (req, res) => {
    const errors = validationResult(req);
    const { email, firstName, lastName, phone, password, confirmPassword } = req.body;
    const dataUser = await usersModel.User.findOne({ _id: req.body._id });
    let setPassword = "";
    if (dataUser.password == password) {
      setPassword = password;
    } else {
      setPassword = await usersModel.getHashedPassword(password);
    }
    const user = req.body;
    if (!errors.isEmpty()) {
      res.render("dashboard/update", {
        layout: "dashboard/layouts/dashboard-layout",
        title: "Update user",
        errors: errors.array(),
        user: user,
        dataUser: dataUser,
      });
    } else {
      await usersModel.User.updateOne(
        { _id: req.body._id },
        {
          $set: {
            firstName: firstName,
            lastName: lastName,
            password: setPassword,
            phone: phone,
          },
        }
      ).then(() => {
        res.redirect("/dashboard/user/" + req.body._id);
      });
    }
  },

  deleteUser: async (req, res) => {
    await usersModel.User.deleteOne({ _id: mongoose.Types.ObjectId(req.body._id) }).then(() => {
      res.redirect("/dashboard/users");
    });
  },

  homepage: async (req, res) => {
    await loginActivityModel.LoginActivity.deleteOne({ _id: mongoose.Types.ObjectId(req.user._id) });
    res.clearCookie("AuthToken");
    res.redirect("/");
  },
};
