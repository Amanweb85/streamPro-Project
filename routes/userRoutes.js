const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// === All routes below are protected and require a valid JWT ===
router
  .route("/history")
  .get(userController.getHistory)
  .post(userController.addToHistory)
  .delete(userController.clearHistory);
// History Routes
// router.get("/history",userController.getHistory);
// router.post("/history",userController.addToHistory);
// router.delete("/history",userController.clearHistory);

// get, save, delete video Routes
router
  .route("/video")
  .get(userController.getSavedVideo)
  .post(userController.saveVideo);

router.get("/playlists", userController.getPlaylists);

// Liked Videos Routes
router
  .route("/liked")
  .get(userController.getLikedVideos)
  .post(userController.addToLikedVideos)
  .delete(userController.removeFromLikedVideos);

// Route to get a specific user
router
  .route("/users/:id")
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
