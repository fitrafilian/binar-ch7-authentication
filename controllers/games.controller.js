const mongoose = require("mongoose");
const usersModel = require("../models/users.model");
const historyModel = require("../models/history.model");
const versusModel = require("../models/versus.model");
const loginActivityModel = require("../models/login.model");
const { time } = require("console");

var roomDB;
var timeDB;

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

  multiplier: (req, res) => {
    const express = require("express");
    const socketio = require("socket.io");

    const app = express();

    const server = require("../app");
    const io = socketio.listen(server);

    const { userConnected, connectedUsers, initializeChoices, moves, makeMove, choices } = require("../config/users");
    const { createRoom, joinRoom, exitRoom, rooms } = require("../config/rooms");
    const e = require("express");
    const { exitCode } = require("process");

    io.on("connection", (socket) => {
      socket.on("create-room", (roomId) => {
        if (rooms[roomId]) {
          const error = "This room already exists";
          socket.emit("display-error", error);
        } else {
          userConnected(socket.client.id);
          createRoom(roomId, socket.client.id);
          socket.emit("room-created", roomId);
          socket.emit("player-1-connected");
          socket.join(roomId);
        }
      });

      socket.on("join-room", (roomId) => {
        if (!rooms[roomId]) {
          const error = "This room doen't exist";
          socket.emit("display-error", error);
        } else {
          userConnected(socket.client.id);
          joinRoom(roomId, socket.client.id);
          socket.join(roomId);

          socket.emit("room-joined", roomId);
          socket.emit("player-2-connected");
          socket.broadcast.to(roomId).emit("player-2-connected");
          initializeChoices(roomId);
        }
      });

      socket.on("join-random", () => {
        let roomId = "";

        for (let id in rooms) {
          if (rooms[id][1] === "") {
            roomId = id;
            break;
          }
        }

        if (roomId === "") {
          const error = "All rooms are full or none exists";
          socket.emit("display-error", error);
        } else {
          userConnected(socket.client.id);
          joinRoom(roomId, socket.client.id);
          socket.join(roomId);

          socket.emit("room-joined", roomId);
          socket.emit("player-2-connected");
          socket.broadcast.to(roomId).emit("player-2-connected");
          initializeChoices(roomId);
        }
      });

      socket.on("make-move", ({ playerId, myChoice, roomId }) => {
        makeMove(roomId, playerId, myChoice);

        if (choices[roomId][0] !== "" && choices[roomId][1] !== "") {
          let playerOneChoice = choices[roomId][0];
          let playerTwoChoice = choices[roomId][1];

          if (playerOneChoice === playerTwoChoice) {
            let message = "Both of you chose " + playerOneChoice + " . So it's draw";
            io.to(roomId).emit("draw", message);
          } else if (moves[playerOneChoice] === playerTwoChoice) {
            let enemyChoice = "";

            if (playerId === 1) {
              enemyChoice = playerTwoChoice;
            } else {
              enemyChoice = playerOneChoice;
            }

            io.to(roomId).emit("player-1-wins", { myChoice, enemyChoice });
          } else {
            let enemyChoice = "";

            if (playerId === 1) {
              enemyChoice = playerTwoChoice;
            } else {
              enemyChoice = playerOneChoice;
            }

            io.to(roomId).emit("player-2-wins", { myChoice, enemyChoice });
          }

          choices[roomId] = ["", ""];
        }
      });

      socket.on("disconnect", () => {
        if (connectedUsers[socket.client.id]) {
          let player;
          let roomId;

          for (let id in rooms) {
            if (rooms[id][0] === socket.client.id || rooms[id][1] === socket.client.id) {
              if (rooms[id][0] === socket.client.id) {
                player = 1;
              } else {
                player = 2;
              }

              roomId = id;
              break;
            }
          }

          exitRoom(roomId, player);

          if (player === 1) {
            io.to(roomId).emit("player-1-disconnected");
          } else {
            io.to(roomId).emit("player-2-disconnected");
          }
        }
      });
    });
    res.render("multiplier", {
      title: "Rock, Paper, Scissor",
      layout: "layouts/main",
    });
  },

  playerOne: async (req, res, next) => {
    const authToken = req.cookies["AuthToken"];
    const userdata = loginActivityModel.getUserData(authToken);
    const { roomId } = req.body;
    timeDB = usersModel.getTime();
    roomDB = await versusModel.Versus.insertMany({
      date: timeDB,
      roomId: roomId,
      playerOne: userdata.uid,
    });
  },

  // room: async (req, res) => {
  //   await versusModel.Versus.findOne({ _id: roomDB._id })
  //     .then((response) => {
  //       res.send(response);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // },

  playerTwo: async (req, res) => {
    const authToken = req.cookies["AuthToken"];
    const userdata = loginActivityModel.getUserData(authToken);
    const { roomId, roomDB } = req.body;
    await versusModel.Versus.updateOne(
      {
        date: timeDB,
        roomId: roomId,
      },
      {
        $set: {
          playerTwo: userdata.uid,
        },
      }
    );
  },

  multiplierPost: async (req, res) => {
    const authToken = req.cookies["AuthToken"];
    const userdata = loginActivityModel.getUserData(authToken);
    const { roomId, roomDB, myScore, enemyScore } = req.body;
    await versusModel.Versus.updateOne(
      {
        date: timeDB,
        roomId: roomId,
      },
      {
        $set: {
          // playerTwo: userdata.uid,
          playerOneScore: myScore,
          playerTwoScore: enemyScore,
        },
      }
    );
  },
};
