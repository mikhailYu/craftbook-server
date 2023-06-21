const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String },
  googleId: { type: String },
  email: { type: String },
  setUpComplete: { type: Boolean },
  theme: { type: Number },
  bio: { type: String },
  location: { type: String },
  profilePic: {
    defaultSettings: { isDefault: Boolean, defaultIndex: Number },
    picId: { type: Schema.Types.ObjectId, ref: "Image" },
  },
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  pendingFriends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  notifications: { type: Array },
  guest: { type: Boolean },
});

UserSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", UserSchema);
