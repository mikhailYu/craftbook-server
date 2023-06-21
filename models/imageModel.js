const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const multer = require("multer");

const ImageSchema = new Schema({
  name: String,
  data: Buffer,
});

ImageSchema.set("toJSON", { virtuals: true });
module.exports = mongoose.model("Image", ImageSchema);
