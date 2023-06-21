var express = require("express");
var router = express.Router();
const commentController = require("../controllers/commentController");

router.post("/create", commentController.commentCreate);

router.get("/get/:id", commentController.commentGet);

router.post("/delete", commentController.commentDelete);

router.post("/like/:id", commentController.commentLiked);

module.exports = router;
