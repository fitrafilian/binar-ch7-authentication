const usersModel = require("../models/users.model");
const biodataModel = require("../models/biodata.model");
const historyModel = require("../models/history.model");
const versusModel = require("../models/versus.model");
const { body, validationResult, check } = require("express-validator");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const loginActivityModel = require("../models/login.model");

module.exports = {
  register: (req, res) => {
    res.render("register", {
      title: "Register",
      layout: "layouts/main",
    });
  },

  login: (req, res) => {
    res.render("login", {
      layout: "layouts/main",
      title: "Log In",
    });
  },

  postRegister: async (req, res) => {
    const errors = validationResult(req);
    const { email, firstName, lastName, password, confirmPassword } = req.body;
    const hashedPassword = await usersModel.getHashedPassword(password);
    if (!errors.isEmpty()) {
      res.render("register", {
        layout: "layouts/main",
        title: "Register",
        errors: errors.array(),
      });
    } else {
      await usersModel.User.insertMany({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
      res.render("login", {
        layout: "layouts/main",
        title: "Log In",
        message: "Account successfully created",
        messageClass: "alert-success",
      });
    }
  },

  postLogin: async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = usersModel.getHashedPassword(password);

    const user = await usersModel.User.findOne({
      email: email,
      password: hashedPassword,
    });

    userdata = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    };

    let emailAdmin = "";
    if (email == "admin@admin.com") {
      emailAdmin = email;
    }

    const admin = await usersModel.User.findOne({
      email: emailAdmin,
      password: hashedPassword,
    });

    if (admin || user) {
      const time = usersModel.getTime();
      user.time = time;

      let Token = loginActivityModel.JWTCreate({
        date: time,
        uid: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      });

      userdata = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        token_type: "Bearer",
        token: Token,
      };

      await loginActivityModel.LoginActivity.insertMany({
        date: time,
        uid: user._id,
        userdata: userdata,
      });

      // Store authentication token
      // dataTokens[authToken] = jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET);
      // const authToken = usersModel.generateAuthToken(user);
      // dataTokens[authToken] = user;

      // Setting the auth token in cookies
      res.cookie("AuthToken", Token, {
        expires: new Date(Date.now() + 900000),
      });

      if (admin) {
        res.redirect("/dashboard");
      } else {
        res.redirect("/");
      }
    } else {
      res.render("login", {
        layout: "layouts/main",
        title: "Log In",
        message: "Invalid username or password",
        messageClass: "alert-danger",
      });
    }
  },

  updatePut: async (req, res) => {
    const errors = validationResult(req);
    const { email, firstName, lastName, password, confirmPassword } = req.body;
    const dataUser = await usersModel.User.findOne(mongoose.Types.ObjectId(req.user._id));
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
          },
        }
      ).then(() => {
        res.redirect("/");
      });
    }
  },

  // auth: (req, res, next) => {
  //   // Get auth token from the cookies
  //   const authToken = req.cookies["AuthToken"];

  //   // Inject the user to the request
  //   req.user = dataTokens[authToken];

  //   next();
  // },

  profile: async (req, res) => {
    const authToken = req.cookies["AuthToken"];
    const userdata = loginActivityModel.getUserData(authToken);
    let user = await usersModel.User.findOne({ _id: userdata.uid });
    let biodata = await biodataModel.Biodata.findOne({ uid: userdata.uid });
    let histories = await historyModel.History.find({ uid: userdata.uid });
    let versusHistories1 = await versusModel.Versus.find({ playerOne: userdata.uid });
    let versusHistories2 = await versusModel.Versus.find({ playerTwo: userdata.uid });
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
    if (biodata) {
      res.render("profile", {
        layout: "layouts/main",
        title: "Profile",
        user: user,
        biodata: biodata,
        histories: histories,
        versus: Versus,
      });
    } else {
      biodata = {
        biodata: "",
      };
      res.render("profile", {
        layout: "layouts/main",
        title: "Profile",
        user: user,
        biodata: biodata,
        histories: histories,
        versus: Versus,
      });
    }
  },

  updateProfile: async (req, res) => {
    const authToken = req.cookies["AuthToken"];
    const userdata = loginActivityModel.getUserData(authToken);
    const errors = validationResult(req);
    const { email, firstName, lastName, phone } = req.body;
    const dataUser = await usersModel.User.findOne({ _id: userdata.uid });
    const user = req.user;
    if (!errors.isEmpty()) {
      res.render("profile", {
        layout: "layouts/main",
        title: "Update user",
        errors: errors.array(),
        user: user,
        dataUser: dataUser,
      });
      console.log("error");
    } else {
      await usersModel.User.updateOne(
        { _id: userdata.uid },
        {
          $set: {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
          },
        }
      ).then(() => {
        req.user.firstName = firstName;
        req.user.lastName = lastName;
        req.user.phone = phone;
        res.redirect("/user/profile");
      });
    }
  },

  updatePassword: async (req, res) => {
    const authToken = req.cookies["AuthToken"];
    const userdata = loginActivityModel.getUserData(authToken);
    const errors = validationResult(req);
    const { oldPassword, password, confirmPassword } = req.body;
    const hashedPassword = await usersModel.getHashedPassword(password);
    const dataUser = await usersModel.User.findOne({ _id: userdata.uid });
    const user = await usersModel.User.findOne({ _id: userdata.uid });
    let biodata = await biodataModel.Biodata.findOne({ uid: userdata.uid });
    let histories = await historyModel.History.find({ uid: userdata.uid });
    if (!errors.isEmpty()) {
      res.render("profile", {
        layout: "layouts/main",
        title: "Update User",
        errors: errors.array(),
        user: user,
        dataUser: dataUser,
        biodata: biodata,
        histories: histories,
      });
      console.log("gagal");
    } else {
      await usersModel.User.updateOne(
        { _id: userdata.uid },
        {
          $set: {
            password: hashedPassword,
          },
        }
      ).then(() => {
        res.redirect("/user/profile");
      });
      console.log("sukses");
    }
  },

  biodataUpdate: async (req, res) => {
    const authToken = req.cookies["AuthToken"];
    const userdata = loginActivityModel.getUserData(authToken);
    const { biodata } = req.body;
    // const user = req.user;
    const userBio = await biodataModel.Biodata.findOne({ uid: mongoose.Types.ObjectId(userdata.uid) });
    if (userBio) {
      await biodataModel.Biodata.updateOne(
        { uid: mongoose.Types.ObjectId(userdata.uid) },
        {
          $set: {
            biodata: biodata,
          },
        }
      ).then(() => {
        res.redirect("/user/profile");
      });
    } else {
      await biodataModel.Biodata.insertMany({
        biodata: biodata,
        uid: mongoose.Types.ObjectId(userdata.uid),
      }).then(() => {
        res.redirect("/user/profile");
      });
    }
  },

  // history: async (req, res) => {
  //   const { playerScore, computerScore, result } = req.body;
  //   if (result.length > 0) {
  //     const time = usersModel.getTime();
  //     req.body.time = time;
  //     await historyModel.History.insertMany({
  //       date: req.body.time,
  //       player: playerScore,
  //       computer: computerScore,
  //       result: result,
  //       uid: mongoose.Types.ObjectId(req.user._id),
  //     }).then(() => {
  //       res.redirect("/");
  //     });
  //   } else {
  //     res.redirect("/");
  //   }
  // },

  logout: async (req, res) => {
    await loginActivityModel.LoginActivity.deleteOne({ _id: mongoose.Types.ObjectId(req.user._id) });
    res.clearCookie("AuthToken");
    res.redirect("/");
  },

  userActivity: async (req, res) => {
    loginActivityModel.LoginActivity.find()
      .select(["userdata.firstName", "userdata.lastName", "userdata.email"])
      .then((response) => {
        res.send(response);
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
