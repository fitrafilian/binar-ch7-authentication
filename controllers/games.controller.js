const mongoose = require("mongoose");
const usersModel = require("../models/users.model");
const historyModel = require("../models/history.model");
const versusModel = require("../models/versus.model");
const loginActivityModel = require("../models/login.model");

module.exports = {
  games: (req, res) => {
    res.render("games", {
      title: "Rock, Paper, Scissor",
      layout: "layouts/main",
    });
  },

  history: async (req, res) => {
    const authToken = req.cookies["AuthToken"];
    const userdata = loginActivityModel.getUserData(authToken);
    const { playerScore, computerScore, result } = req.body;
    if (result.length > 0) {
      const time = usersModel.getTime();
      req.body.time = time;
      await historyModel.History.insertMany({
        date: req.body.time,
        player: playerScore,
        computer: computerScore,
        result: result,
        uid: mongoose.Types.ObjectId(userdata.uid),
      }).then(() => {
        res.redirect("/");
      });
    } else {
      res.redirect("/");
    }
  },

  join: async (req, res) => {
    const authToken = req.cookies["AuthToken"];
    const userdata = loginActivityModel.getUserData(authToken);
    const room = req.body.roomNumber;
    const exist = await versusModel.Versus.findOne({
      room: room,
    });
    if (exist) {
      await usersModel.User.updateOne(
        { room: room },
        {
          $set: {
            playerTwo: {
              uid: mongoose.Types.ObjectId(userdata.uid),
            },
          },
        }
      ).then(() => {
        res.render("waiting-room", {
          title: "Rock, Paper, Scissor",
          layout: "layouts/main",
          room: room,
        });
      });
    }
  },

  waitingRoom: async (req, res) => {
    const authToken = req.cookies["AuthToken"];
    const userdata = loginActivityModel.getUserData(authToken);
    const room = req.params.room;
    const time = usersModel.getTime();
    req.body.time = time;
    await versusModel.Versus.insertMany({
      date: req.body.time,
      room: room,
      playerOne: {
        uid: mongoose.Types.ObjectId(userdata.uid),
      },
    });
    res.render("waiting-room", {
      title: "Rock, Paper, Scissor",
      layout: "layouts/main",
      room: room,
    });
  },

  versus: async (req, res) => {
    const room = req.params.room;
    const ready = await versusModel.Versus.findOne({
      room: room,
      playerOne: { $exists: true },
      playerTwo: { $exists: true },
    });
    if (ready) {
      res.render("versus", {
        title: "Rock, Paper, Scissor",
        layout: "layouts/main",
      });
    } else {
      res.render("waiting-room", {
        title: "Rock, Paper, Scissor",
        layout: "layouts/main",
        room: room,
        message: "Cannot find your opponent",
        messageClass: "alert-danger",
      });
    }
  },
};
