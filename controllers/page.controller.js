const usersController = require("../controllers/users.controller");
const usersModel = require("../models/users.model");
const loginActivityModel = require("../models/login.model");
let dataTokens = usersController.dataTokens;
let tokenUser = usersController.tokenUser;

module.exports = {
  index: (req, res) => {
    const number = Math.floor(100000 + Math.random() * 900000);
    res.setHeader("Content-Type", "text/html");
    res.render("index", {
      user: req.user,
      layout: "layouts/main",
      title: "Traditional Games",
      room: number,
    });
  },

  // auth: (req, res, next) => {
  //   // Get auth token from the cookies
  //   const authToken = req.cookies["AuthToken"];

  //   // Inject the user to the request
  //   req.user = dataTokens[authToken];
  //   next();
  // },

  // token: (req, res) => {
  //   res.send(req.token1);
  // },

  // games: (req, res) => {
  //   res.render("games", {
  //     title: "Rock, Paper, Scissor",
  //     layout: "layouts/main",
  //   });
  // },
};
