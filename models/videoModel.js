const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    // Your unique ID (video ID or playlist ID)
    id: {
      type: String,
      required: true,
      unique: true,
      index: true, // for fast lookups (e.g., during deletion)
    },
    type: {
      type: String,
      required: true,
      enum: ["video", "playlist"],
    },
    snippet: {
      channelTitle: String,
      title: String,
      thumbnails: Object,
      publishedAt: String,
    },
    contentDetails: {
      duration: String, // for videos
      itemCount: Number, // for playlist
    },
    statistics: {
      viewCount: String,
      likeCount: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", VideoSchema);
