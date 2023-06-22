const User = require("../models/userModel");
const Image = require("../models/imageModel");
const asyncHandler = require("express-async-handler");
const configServer = require("../config/configServerDev.js");
const passport = require("passport");
const uniqid = require("uniqid");

exports.authUser = passport.authenticate("google", {
  scope: ["email profile"],
});

exports.authLogout = async (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      res.status(404).json("error");
    }
    res.status(200).json("success");
  });
};

exports.authRedirect = passport.authenticate("google", {
  successRedirect: configServer.clientUrl + "/authenticate",
  failureRedirect: "/login/failed",
});

exports.getAuth = asyncHandler(async (req, res, next) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } else {
    res.status(200).json({
      success: false,
    });
  }
});

exports.getUserData = asyncHandler(async (req, res, next) => {
  User.findById(req.params.id)
    .populate({
      path: "posts",
      populate: {
        path: "user",
      },
      options: { sort: { date: -1 } },
    })
    .populate("friends")
    .exec()
    .then(function (data) {
      res.status(200).json({ success: true, user: data });
    })
    .catch(function (err) {
      if (err) {
        res.status(200).json({ success: false });
      }
    });
});

exports.authFail = asyncHandler(async (req, res, next) => {
  res.send("User settings update");
});

exports.sendFriendReq = asyncHandler(async (req, res, next) => {
  const senderId = Object(req.body.senderId);
  const receiverId = Object(req.body.receiverId);
  const notifId = uniqid();

  User.updateOne(
    { _id: receiverId },
    {
      $push: {
        pendingFriends: senderId,
        notifications: {
          id: notifId,
          type: "req",
          senderId: senderId,
          engaged: false,
        },
      },
    }
  )
    .then(function (data) {
      res.status(200).json({ success: true });
    })
    .catch(function (err) {
      if (err) {
        res.status(404).json({ success: false });
      }
    });
});

exports.cancelFriendReq = asyncHandler(async (req, res, next) => {
  const senderId = Object(req.body.senderId);
  const receiverId = Object(req.body.receiverId);

  User.updateOne(
    { _id: receiverId },
    {
      $pull: {
        pendingFriends: senderId,
        notifications: { type: "req", senderId: senderId },
      },
    }
  )
    .then(function (data) {
      res.status(200).json({ success: true });
    })
    .catch(function (err) {
      if (err) {
        res.status(404).json({ success: false });
      }
    });
});

exports.acceptFriendReq = asyncHandler(async (req, res, next) => {
  const senderId = Object(req.body.senderId);
  const receiverId = Object(req.body.receiverId);
  const notifId = uniqid();

  User.updateOne(
    { _id: senderId },
    {
      $pull: {
        pendingFriends: receiverId,
        notifications: { type: "req", senderId: receiverId },
      },
      $push: {
        friends: receiverId,
      },
    }
  ).then(function (data) {
    User.updateOne(
      { _id: receiverId },
      {
        $push: {
          friends: senderId,
          notifications: {
            id: notifId,
            type: "accept",
            senderId: senderId,
            engaged: false,
          },
        },
      }
    )
      .then(function (data) {
        res.status(200).json({ success: true });
      })
      .catch(function (err) {
        if (err) {
          res.status(404).json({ success: false });
        }
      });
  });
});

exports.unfriend = asyncHandler(async (req, res, next) => {
  const senderId = Object(req.body.senderId);
  const receiverId = Object(req.body.receiverId);

  User.updateOne({ _id: senderId }, { $pull: { friends: receiverId } }).then(
    function (data) {
      User.updateOne({ _id: receiverId }, { $pull: { friends: senderId } })
        .then(function (data) {
          res.status(200).json({ success: true });
        })
        .catch(function (err) {
          if (err) {
            res.status(404).json({ success: false });
          }
        });
    }
  );
});

exports.updateUserSettings = asyncHandler(async (req, res, next) => {
  const data = Object(req.body);
  const existingData = data.existingData;
  let profilePicData;

  if (data.shouldUpdatePic == false) {
    profilePicData = existingData.profilePic;
  } else {
    if (existingData.profilePic.picId != null) {
      await Image.findOneAndDelete({ _id: existingData.profilePic.picId });
    }
    profilePicData = data.profilePic;
  }

  await User.updateOne(
    { _id: data.id },
    {
      username: data.username,
      bio: data.bio,
      location: data.location,
      profilePic: profilePicData,
      setUpComplete: true,
      theme: data.theme,
    },
    {
      upsert: true,
    }
  );

  res.status(200).json("Success");
});

exports.allNotifsEngaged = asyncHandler(async (req, res, next) => {
  const data = Object(req.body);

  User.updateOne({ _id: data.id }, { $set: { notifications: data.newNotifs } })
    .then(function (data) {
      res.status(200).json({ success: true });
    })
    .catch(function (err) {
      if (err) {
        res.status(404).json({ success: false });
      }
    });
});

exports.getNotifications = asyncHandler(async (req, res, next) => {
  User.findById(req.params.id)
    .then(function (data) {
      res.status(200).json({ success: true, data: data.notifications });
    })
    .catch(function (err) {
      if (err) {
        res.status(200).json({ success: false });
      }
    });
});

exports.getFriendData = asyncHandler(async (req, res, next) => {
  const userData = await User.findById(Object(req.body.userId));
  const profileData = await User.findById(Object(req.body.profileId));

  res.status(200).json([{ userData: userData }, { profileData: profileData }]);
});
