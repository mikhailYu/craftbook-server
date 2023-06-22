var express = require("express");
var router = express.Router();
const userController = require("../controllers/userController");

const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const passport = require("passport");

router.get("/auth", userController.authUser);

//putting this here due to auto format adding unusual brackets

router.post("/authGuest", passport.authenticate("local"), function (req, res) {
  res.json(req.user);
});

router.get("/redirect", userController.authRedirect);

router.get("/failed", userController.authFail);

router.get("/getAuth", userController.getAuth);

router.get("/getUserData/:id", userController.getUserData);

router.post("/logout", userController.authLogout);

router.post("/update", userController.updateUserSettings);

router.post("/sendFriendReq", userController.sendFriendReq);

router.post("/cancelFriendReq", userController.cancelFriendReq);

router.post("/acceptFriendReq", userController.acceptFriendReq);

router.post("/unfriend", userController.unfriend);

router.post("/allNotifsEngaged", userController.allNotifsEngaged);

router.get("/getNotifications/:id", userController.getNotifications);

router.post("/getFriendData", userController.getFriendData);

module.exports = router;
