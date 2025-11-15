const { google } = require("googleapis");

// Creating a YouTube client
const youtube = google.youtube({
  version: "v3",
  auth: process.env.GOOGLE_API_KEY,
});

async function getComments(videoId, pageToken = "") {
  try {
    // request parameters object
    const requestParams = {
      part: "snippet,replies",
      videoId: videoId,
      maxResults: 20,
    };

    if (pageToken) {
      requestParams.pageToken = pageToken;
    }

    const response = await youtube.commentThreads.list(requestParams);

    if (!response.data.items || response.data.items.length === 0) {
      console.warn(`⚠️ No comments found for video ${videoId}`);
      return { data: null };
    }
    console.log("    response", response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching comments:", err);
  }
}

module.exports = { getComments };
