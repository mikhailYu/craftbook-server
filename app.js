require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var session = require("express-session");
var multer = require("multer");

var router = express.Router();
var passport = require("passport");

const passportSetup = require("./config/passportConfig");

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://mikhailyu.github.io/craftbook-ui",
    "https://mikhailyu.github.io",
    // LIST ALL YOUR LINKS FROM THE FRONTEND
  ],
  credentials: true,

  optionSuccessStatus: 200,
};

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = process.env.DB_CONNECT;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

var indexRouter = require("./routes/index");
var userRouter = require("./routes/user");
var postRouter = require("./routes/post");
var commentRouter = require("./routes/comment");
var imageRouter = require("./routes/image");

var app = express();
app.set("trust proxy", 1);
app.use(cors(corsOptions)); // Use this after the variable declaration

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 86400000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ extended: false, limit: "50mb", parameterLimit: 10000 })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/image", imageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
