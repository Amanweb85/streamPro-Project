const User = require("../models/userModel");
const Video = require("../models/videoModel");

// *****************************  History Operations *************************---

exports.getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("history")
      .populate({
        path: "history.mediaId",
        model: "Video",
        select: "id type snippet contentDetails statistics",
      })
      .lean();

    const formattedHistory = user.history.map((entry) => {
      const { watchedAt, seekTime } = entry;
      const { id, type, snippet, contentDetails, statistics } = entry.mediaId;

      return {
        watchedAt: watchedAt,
        seekTime: seekTime,
        id: id,
        type: type,
        snippet: snippet,
        contentDetails: contentDetails,
        statistics: statistics,
      };
    });
    return formattedHistory;
  } catch (error) {
    console.error("Error fetching formatted history data:", error);
    return [];
  }
};

//------------POST /history - updating history ---------------

exports.addToHistory = async (req, res) => {
  const { video } = req.body;
  const userId = req.user.id;

  const videoDataToSave = {
    id: video.id,
    type: video.type,
    snippet: video.snippet || {},
    contentDetails: video.contentDetails || {},
    statistics: video.statistics || {},
  };

  try {
    // 1. Find OR Create (Upsert) the Video
    const videoDocument = await Video.findOneAndUpdate(
      { id: video.id },
      {
        $set: videoDataToSave,
      },
      {
        upsert: true, // Create the document if it doesn't exist
        new: true, // Return the updated/new document
        setDefaultsOnInsert: true,
      }
    ).lean(); // Use .lean() for faster read performance

    const mediaId = videoDocument._id;

    // 2: Pull the Duplicate Entry from User History
    const pullResult = await User.updateOne(
      { _id: userId },
      {
        $pull: {
          history: { mediaId },
        },
      }
    );

    if (pullResult.modifiedCount > 0)
      console.log(`Video ID ${video.id} moved to front (duplicate removed).`);

    // 3: Push the New Entry to the Front
    const newHistoryEntry = {
      mediaId,
      watchedAt: new Date(),
      seekTime: video.seekTime || 0,
    };

    await User.updateOne(
      { _id: userId },
      {
        $push: {
          history: {
            $each: [newHistoryEntry],
            $position: 0,
            $slice: -50, // Keep only the last 50 entries
          },
        },
      }
    );

    res.json(video);
  } catch (err) {
    console.log("Failed to update user history:", err);
    res.status(500).send("Server error");
  }
};

//---------- DELETE /history- clearing entire watch history ------------

exports.clearHistory = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $set: { history: [] }, // Sets the history array to be empty
    });
    res.status(200).json({ message: "History cleared." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ********************************* saved Video **************************************
exports.getSavedVideo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("savedVideos")
      .populate({
        path: "savedVideos",
        model: "Video",
        select: "id type snippet contentDetails statistics",
      })
      .lean();
    res.status(200).json(user.savedVideos);
  } catch (error) {
    console.error("Error retrieving saved media:", error);
    res
      .status(500)
      .json({ message: error.message || "An internal server error occurred." });
  }
};

exports.saveVideo = async (req, res) => {
  const { video } = req.body;
  const userId = req.user.id;

  const videoDataToSave = {
    id: video.id,
    type: video.type,
    snippet: video.snippet || {},
    contentDetails: video.contentDetails || {},
    statistics: video.statistics || {},
  };

  try {
    // 1. Find OR Create (Upsert) the Video
    const videoDocument = await Video.findOneAndUpdate(
      { id: video.id },
      {
        $set: videoDataToSave,
      },
      {
        upsert: true, // Create the document if it doesn't exist
        new: true, // Return the final document
        setDefaultsOnInsert: true,
      }
    ).lean(); // Use .lean() for faster read performance

    const mediaId = videoDocument._id;
    const arrayField = video.type === "video" ? "savedVideos" : "playlists";
    const mediaType = video.type === "video" ? "Video" : "Playlist";

    // 2: Pull the Duplicate Entry from User History
    const pullResult = await User.updateOne(
      { _id: userId },
      {
        $pull: {
          [arrayField]: mediaId,
        },
      },
      {
        timestamps: false,
      }
    );

    let message;
    if (pullResult.modifiedCount == 0)
      console.log(`Video ID ${video.id} moved to front (duplicate removed).`);
    else message = `${mediaType} aready exist in ${arrayField}.`;

    const pushResult = await User.updateOne(
      { _id: userId },
      {
        $push: {
          [arrayField]: {
            $each: [mediaId],
            $position: 0,
          },
        },
      }
    );
    if (pushResult.modifiedCount > 0) {
      console.log(
        `${mediaType} added/moved to the top of ${arrayField} successfully.`
      );
      message = message || `${mediaType} added to your list successfully.`;
    }
    res.status(200).json({
      message,
    });
    // res.json(video);
  } catch (err) {
    console.log("Error in saveVideo:", err);
    res.status(500).send("Server error", err.message);
  }
};

// ********************************* playlists *****************************************
exports.getPlaylists = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("playlists")
      .populate({
        path: "playlists",
        model: "Video",
        select: "id type snippet contentDetails statistics",
      })
      .lean();
    res.status(200).json(user.playlists);
  } catch (error) {
    console.error("Error retrieving saved media:", error);
    res
      .status(500)
      .json({ message: error.message || "An internal server error occurred." });
  }
};
// *************************** Liked Videos Operations ********************************

//-------- GET /liked - Fetching the user's liked videos -----------

exports.getLikedVideos = async (req, res) => {
  try {
    console.log("gettign like video");
    const user = await User.findById(req.user.id).select("likedVideos");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.likedVideos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------- POST /liked - Adding a video to liked videos (Like) -------

exports.addToLikedVideos = async (req, res) => {
  try {
    const videoToAdd = req.body;
    if (!videoToAdd || !videoToAdd.videoId) {
      return res.status(400).json({ message: "Video data is required." });
    }

    const result = await User.updateOne(
      {
        _id: req.user.id, // Find the correct user
        "likedVideos.videoId": { $ne: videoToAdd.videoId }, // AND only match if this videoId is NOT in the array
      },
      {
        $push: { likedVideos: videoToAdd }, // If the condition above is met, push the video
      }
    );

    if (result.modifiedCount > 0) {
      res
        .status(200)
        .json({ message: "Video added to liked videos successfully." });
    } else {
      res.status(200).json({ message: "Video is already in your liked list." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//------ DELETE /liked - Removes a video from liked videos ----------

exports.removeFromLikedVideos = async (req, res) => {
  try {
    const { videoId } = req.body; // Expects the videoId to identify which video to remove
    if (!videoId)
      return res.status(400).json({ message: "videoId is required." });

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { likedVideos: { videoId: videoId } },
    });
    res.status(200).json({ message: "Video removed from liked videos." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// *****************************************************************************************

// --- READ a user's profile ---
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // Exclude password from result
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user.", error: error.message });
  }
};

// --- UPDATE a user's details ---
exports.updateUser = async (req, res) => {
  try {
    const { fullname, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { fullname, email },
      { new: true, runValidators: true } // Return the updated doc and run schema validators
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res
      .status(200)
      .json({ message: "User updated successfully.", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user.", error: error.message });
  }
};

// --- DELETE a user ---
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user.", error: error.message });
  }
};
