const express = require("express");
const router = express.Router(); // creating a new Router object
const videoController = require("../controllers/videoController");
const apiDataController = require("../controllers/apiDataController");

// Define routes for the video API
router.get("/videoDetails", videoController.getVideoDetails);
// router.get('/relatedVideosData', videoController.relatedVideosData);
router.get("/videoFormats", videoController.getVideoFormats);

// Defining routes for youtube data fetching
router.get("/category", apiDataController.getCategoryData);
router.get("/search", apiDataController.getSearchData);
router.get("/suggestedVideos", apiDataController.getSuggestedVideoData);
router.get("/comments", apiDataController.getCommentData);
// router.get("/getPlayingVideoDetail", apiDataController.getPlayingVideoDetail);

module.exports = router;
