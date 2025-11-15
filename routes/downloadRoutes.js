const express = require("express");
const router = express.Router(); // creating a new Router object
const protect = require("../middleware/auth");
const downloadController = require("../controllers/downloadController");

// Define route for the downloading video
router.post("/downloadVideo", protect, downloadController.downloadVideo);
router.get("/downloadPlaylist", protect, downloadController.downloadPlaylist);
router.get(
  "/startDownloadStream",
  protect,
  downloadController.startDownloadStream
);

router.get(
  "/serveDownload/:sessionId/:fileName",
  downloadController.serverDownload
);

module.exports = router;
