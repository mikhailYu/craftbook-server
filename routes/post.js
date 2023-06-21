var express = require("express");
var router = express.Router();
const postController = require("../controllers/postController");

router.post("/create", postController.postCreate);

router.post("/delete/:id", postController.postDelete);

router.post("/likeToggle/:id", postController.postLikeToggle);

router.get("/generateFeed/:id", postController.generateFeed);

router.get("/userPosts/:id", postController.getUserPosts);

router.post("/commentAdd/:id", postController.postCommentAdd);

router.get("/getPost/:id", postController.getPost);

module.exports = router;
