const { getSearchVideos } = require("../services/searchVideoService");
const { getComments } = require("../services/commentsService");
const { getSuggestedVideos } = require("../services/suggestedVideoService");
const { getCategoryVideoData } = require("../services/getCategoryVideoData");

exports.getSearchData = async (req, res) => {
  const { searchQuery } = req.query;
  const searchVideos = await getSearchVideos(searchQuery);
  res.json(searchVideos);
};

exports.getPlayingVideoDetail = (req, res) => {
  const { videoId } = req.query;
  const playingVideoDetail_Url = `df`;
  // `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&thumbnails&id=${videoUrl}&maxResults=12&key=${Google_API_KEY}`;

  fetch(`${playingVideoDetail_Url}`)
    .then((response) => response.json())
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.send(err));
};

exports.getSuggestedVideoData = (req, res) => {
  const { videoId, pageToken } = req.query;
  const suggestedVideos = getSuggestedVideos(videoId, pageToken);
  res.json(suggestedVideos);
};

exports.getCommentData = async (req, res) => {
  const { videoId, pageToken } = req.query;
  const comments = await getComments(videoId, pageToken);
  res.json(comments);
};
exports.getCategoryData = async (req, res) => {
  const { categoryId } = req.query;
  const videos = await getCategoryVideoData(categoryId);
  res.json(videos);
};
