const Post = require("../models/postModel");
const User = require("../models/userModel");
const Comment = require("../models/commentModel");
const Image = require("../models/imageModel");
const asyncHandler = require("express-async-handler");
const uniqid = require("uniqid");

exports.postCreate = asyncHandler(async (req, res, next) => {
  const data = Object(req.body);
  const date = new Date();

  const post = new Post({
    user: data.userId,
    text: data.text,
    date: date,
    image: data.image,
  });

  const userData = await User.findById({ _id: data.userId });

  await post.save();

  User.updateOne({ _id: data.userId }, { $push: { posts: post.id } })
    .then(function (data) {
      post.user = userData;
      res.status(200).json({ success: true, data: post });
    })
    .catch(function (err) {
      if (err) {
        res.status(404).json({ success: false });
      }
    });
});

exports.postDelete = asyncHandler(async (req, res, next) => {
  const data = Object(req.body);

  const postData = await Post.findById({ _id: req.params.id });

  if (postData.image != null) {
    await Image.findByIdAndDelete({ _id: postData.image });
  }

  await Comment.deleteMany({
    _id: postData.comments,
  });

  User.updateOne(
    { _id: data.userId },
    {
      $pull: {
        posts: { _id: req.params.id },
      },
    }
  ).then(() => {
    Post.deleteOne({ _id: req.params.id })
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

exports.getPost = asyncHandler(async (req, res, next) => {
  Post.findById({ _id: req.params.id })
    .populate("user")
    .exec()
    .then(function (data) {
      res.status(200).json({ success: true, post: data });
    })
    .catch(function (err) {
      if (err) {
        res.status(404).json({ success: false });
      }
    });
});

exports.postLikeToggle = asyncHandler(async (req, res, next) => {
  const userId = Object(req.body.userId);
  const userIncludes = Object(req.body.userIncludes);
  const posterId = Object(req.body.posterId);
  const notifId = uniqid();
  const sendNotif = Object(req.body.sendNotif);

  if (userIncludes == true) {
    await Post.updateOne(
      { _id: req.params.id },
      {
        $pull: {
          likes: userId,
        },
      }
    );
  } else {
    await Post.updateOne(
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
              type: "likePost",
              id: notifId,
              senderId: userId,
              postId: req.params.id,
              engaged: false,
            },
          },
        }
      );
    }
  }

  res.status(200).json("success");
});

exports.generateFeed = asyncHandler(async (req, res, next) => {
  const user = await User.findById({ _id: req.params.id });
  const limitPosts = 30;

  const friendsArr = [...user.friends, user._id];
  let miscPosts = [];

  const friendPosts = await Post.find({
    user: { $in: friendsArr },
  })
    .limit(limitPosts)
    .populate("user")
    .sort({ date: -1 })
    .exec();

  if (friendPosts.length != limitPosts) {
    miscPosts = await Post.find({
      user: { $nin: friendsArr },
    })
      .limit(limitPosts - friendPosts.length)
      .populate("user")
      .sort({ date: -1 })
      .exec();
  }

  const postsArr = [...friendPosts, ...miscPosts];
  res.status(200).json(postsArr);
});

exports.getUserPosts = asyncHandler(async (req, res, next) => {
  res.send("Got posts of user");
});

exports.postCommentAdd = asyncHandler(async (req, res, next) => {
  res.send("Post got a comment");
});
