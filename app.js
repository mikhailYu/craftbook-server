require("dotenv").config();

var cors = require("cors");
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://mikhailyu.github.io/craftbook-ui",
    "https://mikhailyu.github.io",
    "https://mikhailyu.github.io/craftbook-reactApp",
    // LIST ALL YOUR LINKS FROM THE FRONTEND
  ],
  credentials: true,

  optionSuccessStatus: 200,
};

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var session = require("cookie-session");
var multer = require("multer");

const helmet = require("helmet");

var router = express.Router();
var passport = require("passport");

const passportSetup = require("./config/passportConfig");

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
app.enable("trust proxy");
app.use(cors(corsOptions)); // Use this after the variable declaration

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// might have to delete this, passport related
app.use((request, response, next) => {
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Origin: https://mikhailyu.github.io/",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization",
    "Access-Control-Allow-Private-Network: true"
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  response.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser("secret"));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    path: "/",
    domain: ["craftbook-server.onrender.com"],
    maxAge: new Date(Date.now() + 3600000),
    sameSite: "none",
    secure: true,
    httpOnly: true,

    // cookie: {
    //   maxAge: new Date(Date.now() + 3600000),
    //   sameSite: "none",
    //   secure: true,
    //   httpOnly: true,
    //   path: "/",
    //   domain: ".craftbook-server.onrender.com",
    // },
  })
);

// cookie session related
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ extended: true, limit: "50mb", parameterLimit: 10000 })
);
app.use(bodyParser.json({ type: "application/*" }));

app.use(passport.initialize());
app.use(passport.session());

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
