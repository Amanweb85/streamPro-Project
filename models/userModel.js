const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const HistoryEntrySchema = new mongoose.Schema(
  {
    mediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video", // References the Video model
      required: true,
    },
    watchedAt: {
      type: String,
      default: Date.now,
    },
    seekTime: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    googleId: String,
    fullname: {
      type: String,
      required: true,
    },
    profilePhoto: String,
    password: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    history: [HistoryEntrySchema],
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  },
  { timestamps: true }
);

// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     return next();
//   }
//   if (this.password) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   next();
// });

module.exports = mongoose.model("User", UserSchema);
