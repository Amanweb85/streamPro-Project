const { getSearchVideos } = require("../services/searchVideoService");
const { getComments } = require("../services/commentsService");
const { getSuggestedVideos } = require("../services/suggestedVideoService");

const { commentsByVideoId } = require("../ApiData/commentsData");
const { suggestedDataRapidApi } = require("../ApiData/suggestedDataRapidApi");
const { popularVideoData } = require("../ApiData/popularvideo");

const renderWatchPage = async (req, res, next) => {
  try {
    const videoId = req.query.id;
    const listId = req.query.listId;
    const seekTo = req.query.t;
    console.log(videoId, listId);
    // const [comments, suggestedVideos] = await Promise.all([
    //     getComments(videoId),
    //     getSuggestedVideos(videoId),
    // ]);

    res.render("layout", {
      title: "Watch Page",
      viewName: "watch",
      cssFile: "watch.css",
      scripts: ["/dist/common.js", "/dist/watch.js"],
      comments: commentsByVideoId,
      videoId,
      listId,
      seekTo,
      suggestedVideos: suggestedDataRapidApi,
    });
  } catch (err) {
    next(err);
  }
};
const renderSearchPage = async (req, res, next) => {
  res.locals.user = req.user || null;
  // console.log("user is:", req.user);
  console.log("in search page", res.locals.success_msg);
  // return res.send([
  //   res.locals.success_msg,
  //   req.flash("successMsg"),
  //   res.locals,
  // ]);

  try {
    const query = req.query.sq;
    let searchVideos;
    if (query) searchVideos = await getSearchVideos(query);
    else searchVideos = popularVideoData;
    // console.log(searchVideos);

    res.render("layout", {
      title: "Search Page",
      viewName: "search",
      cssFile: "search.css",
      scripts: ["/dist/common.js", "/dist/search.js"],
      searchVideos,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { renderWatchPage, renderSearchPage };
