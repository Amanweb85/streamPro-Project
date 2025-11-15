const { popularVideoData } = require("../ApiData/popularvideo.js");

const { google } = require("googleapis");

// Create a YouTube client using just an API key
const youtube = google.youtube({
  version: "v3",
  auth: process.env.GOOGLE_API_KEY, // ✅ THIS is how you pass API key correctly
});

async function getCategoryVideoData(categoryId) {
  try {
    const response = await youtube.videos.list({
      part: "snippet,statistics,contentDetails",
      chart: "mostPopular",
      regionCode: "IN",
      videoCategoryId: categoryId,
      maxResults: 10,
      fields:
        "nextPageToken,items(id,snippet(title,channelTitle,publishedAt,thumbnails(medium,high,maxres)),statistics(viewCount,likeCount),contentDetails(duration))",
    });

    if (!response.data.items || response.data.items.length === 0) {
      console.warn(`⚠️ No videos found for category ${categoryId}`);
      return { data: null }; // or skip rendering this category
    }

    return response.data;
  } catch (err) {
    console.error("Error fetching category videos:", err);
  }
  // return popularVideoData;
}
module.exports = { getCategoryVideoData };
