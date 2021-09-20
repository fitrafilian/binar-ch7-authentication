// Core module
const express = require("express");
const app = express();
require("dotenv").config();

// const server = http.createServer(app);

// Third-party module
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");

app.use(cors());

// To support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// To parse cookies from the HTTP Request
app.use(cookieParser());

// To make public folder
app.use(express.static("public"));

// EJS
app.set("view engine", "ejs");
app.use(expressLayouts);

// Setup method-override
app.use(methodOverride("_method"));

// Database
require("./config/db");

// Flash config
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Router
const pageRouter = require("./routes/page.router");
app.use("/", pageRouter);

const usersRouter = require("./routes/users.router");
app.use("/user", usersRouter);

const dashboardRouter = require("./routes/dashboard.router");
app.use("/dashboard", dashboardRouter);

const gamesRouter = require("./routes/games.routes");
app.use("/games", gamesRouter);

// To handle user error
app.get("*", (req, res) => {
  res.render("404", {
    title: "404 not found",
    layout: "layouts/main",
  });
});

const PORT = process.env.PORT;

const http = require("http");

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Listening from port ${PORT}`);
});

module.exports = server;
