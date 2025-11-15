const express = require("express");
const router = express.Router();
const globalData = require("../middleware/globalData");
const protect = require("../middleware/auth");
const {
  renderWatchPage,
  renderSearchPage,
  renderCategoryPage,
} = require("../controllers/watchController");

const User = require("../models/userModel");
const { getHistory } = require("../controllers/userController");

router.get(
  "/search/user/history",
  protect,
  globalData,
  async (req, res, next) => {
    let historyVideos = await getHistory(req, res);
    res.locals.user = req.user || null;

    res.render("layout", {
      title: "history Page",
      viewName: "search",
      cssFile: "search.css",
      scripts: ["/dist/common.js", "/dist/search.js"],
      searchVideos: { items: historyVideos },
    });
  }
);

router.get("/watch", protect, globalData, renderWatchPage);
router.get("/search", globalData, renderSearchPage);

router.get("/", (req, res) => res.redirect("/search"));

module.exports = router;
