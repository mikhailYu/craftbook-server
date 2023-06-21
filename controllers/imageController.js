const Post = require("../models/postModel");
const User = require("../models/userModel");
const Comment = require("../models/commentModel");
const Image = require("../models/imageModel");
const asyncHandler = require("express-async-handler");
const uniqid = require("uniqid");
var multer = require("multer");

exports.imageCreate = asyncHandler(async (req, res, next) => {
  const randomName = uniqid();
  const image = new Image({
    name: randomName,
    data: req.file.buffer,
  });

  image
    .save()
    .then((res) => {
      res.status(200).json({ data: image._id });
    })
    .catch((err) => {
      if (!image._id) {
        res.status(404).json({ success: false });
      } else {
        res.status(200).json({ data: image._id });
      }
    });
});

exports.imageDelete = asyncHandler(async (req, res, next) => {
  await Image.findOneAndDelete({ _id: req.params.id })
    .then((res) => {
      res.status(200).json("success");
    })
    .catch((err) => {
      res.status(404).json({ success: false });
    });
});

exports.imageGet = asyncHandler(async (req, res, next) => {
  await Image.findById({ _id: req.params.id })
    .then((data) => {
      res.status(200).json(data.data);
    })
    .catch((err) => {
      res.status(404).json({ success: false });
    });
});
