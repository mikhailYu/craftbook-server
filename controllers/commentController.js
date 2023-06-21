const Comment = require("../models/commentModel");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const uniqid = require("uniqid");

exports.commentCreate = asyncHandler(async (req, res, next) => {
  const data = Object(req.body);
  const date = new Date();
  const notifId = uniqid();

  const newComment = new Comment({
    userId: data.userId,
    postId: data.postId,
    text: data.text,
    date: date,
  });
  await newComment.save();

  if (data.sendNotif == true) {
    await User.updateOne(
      { _id: data.posterId },
      {
        $push: {
          notifications: {
            type: "commentPost",
            id: notifId,
            senderId: data.userId,
            postId: data.postId,
            engaged: false,
          },
        },
      }
    );
  }

  Post.updateOne({ _id: data.postId }, { $push: { comments: newComment.id } })
    .then(function (data) {
      res.status(200).json({ success: true, data: newComment });
    })
    .catch(function (err) {
      if (err) {
        res.status(404).json({ success: false });
      }
    });
});

exports.commentGet = asyncHandler(async (req, res, next) => {
  Comment.findById({ _id: req.params.id })
    .populate("userId")
    .populate("postId")
    .then(function (data) {
      res.status(200).json({ success: true, data: data });
    })
    .catch(function (err) {
      if (err) {
        res.status(404).json({ success: false });
      }
    });
});

exports.commentDelete = asyncHandler(async (req, res, next) => {
  const postId = Object(req.body.postId);
  const commentId = Object(req.body.commentId);

  Post.updateOne(
    { _id: postId },
    {
      $pull: {
        comments: commentId,
      },
    }
  ).then(() => {
    Comment.deleteOne({ _id: commentId })
      .then(function () {
        res.status(200).json({ success: true });
      })
      .catch(function (err) {
        if (err) {
          res.status(404).json({ success: false });
        }
      });
  });
});

exports.commentLiked = asyncHandler(async (req, res, next) => {
  const userId = Object(req.body.userId);
  const userIncludes = Object(req.body.userIncludes);
  const posterId = Object(req.body.posterId);
  const postId = Object(req.body.postId);
  const sendNotif = Object(req.body.sendNotif);

  const notifId = uniqid();

  if (userIncludes == true) {
    await Comment.updateOne(
      { _id: req.params.id },
      {
        $pull: {
          likes: userId,
        },
      }
    );
  } else {
    await Comment.updateOne(
      { _id: req.params.id },
      {
        $push: {
          likes: userId,
        },
      }
    );

    if (sendNotif == true) {
      await User.updateOne(
        { _id: posterId },
        {
          $push: {
            notifications: {
              type: "likeComment",
              id: notifId,
              senderId: userId,
              postId: postId,
              engaged: false,
            },
          },
        }
      );
    }
  }

  res.status(200).json("success");
});
