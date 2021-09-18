const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const player = new mongoose.Schema({
  uid: {
    type: Schema.Types.ObjectId,
    required: false,
  },
  score: {
    type: Number,
    required: false,
  },
});

const Versus = mongoose.model("versus", {
  date: {
    type: Date,
    required: true,
  },
  room: {
    type: Number,
    required: true,
  },
  playerOne: {
    type: player,
    required: true,
  },
  playerTwo: {
    type: player,
    required: false,
  },
});

const ready = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.render("login", {
      layout: "layouts/main",
      title: "Log In",
      message: "Please login to continue",
      messageClass: "alert-danger",
    });
  }
};

module.exports = { Versus };
