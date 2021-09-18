const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JWT = require("jsonwebtoken");
const SecretKey = process.env.ACCESS_TOKEN_SECRET;

const usersModel = require("../models/users.model");

const LoginActivity = mongoose.model("login_activities", {
  expire_at: {
    type: Date,
    default: Date.now,
    expires: 900,
  },
  date: {
    type: Date,
    required: true,
  },
  uid: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  userdata: {
    type: Object,
    required: true,
  },
});

const JWTCreate = (Data = null, res = null) => {
  let TokenData = JWT.sign(Data, SecretKey);
  return TokenData;
};

const JWTCheck = (Data = null, res = null) => {
  let JWTCheckData = JWT.verify(Data, SecretKey, (err, JWTResult) => {
    if (err) return { message: "jwt error", status: 403 };
    if (JWTResult) return { message: "success to checking jwt", data: JWTResult, status: 200 };
  });

  return JWTCheckData;
};

const getUserData = (authToken) => {
  return JWT.verify(authToken, process.env.ACCESS_TOKEN_SECRET);
};

const authorization = async (req, res, next) => {
  const authToken = req.cookies["AuthToken"];

  if (authToken) {
    JWT.verify(authToken, SecretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.render("login", {
      layout: "layouts/main",
      title: "Log In",
      message: "Please login to continue",
      messageClass: "alert-danger",
    });
  }
};

const authorizationIndex = async (req, res, next) => {
  const authToken = req.cookies["AuthToken"];

  if (authToken) {
    JWT.verify(authToken, SecretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    const number = undefined;
    res.render("index", {
      title: "Traditional Games",
      layout: "layouts/main",
      room: number,
    });
  }
};

module.exports = { LoginActivity, JWTCreate, JWTCheck, authorization, authorizationIndex, getUserData };
