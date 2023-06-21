var express = require("express");
var router = express.Router();
const imageController = require("../controllers/imageController");
var multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/create", upload.single("image"), imageController.imageCreate);

router.get("/get/:id", imageController.imageGet);

router.post("/delete/:id", imageController.imageDelete);

module.exports = router;

//image testing, delete after
