var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// const db = require("./models/index");

// (async () => {
//   await db.sequelize.sync();
//   try {
//     await db.sequelize.authenticate();
//     console.log("Connection to the database successful!");
//   } catch (error) {
//     console.error("Error connecting to the database: ", error);
//   }
// })();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error(
    "Sorry! We couldn't find the page you were looking for."
  );
  err.status = 404;
  console.log("404 error handler called", err);
  res.status(404).render("error", { err, title: "Page Not Found" });
});

// error handler
app.use(function (err, req, res, next) {
  if (err) {
    console.log("Global error handler called", err);
  }
  if (err.status === 404) {
    res.status(404).render("page-not-found", { err });
  } else {
    err.message =
      err.message || "Sorry! There was an unexpected error on the server.";
    err.status = 500;
    res.status(500).render("error", { err, title: "Page Not Found" });
  }
});

module.exports = app;
