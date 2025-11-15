//  fetching search video data
const { popularVideoData } = require("../ApiData/popularvideo.js");

const { google } = require("googleapis");

// Create a YouTube client using just an API key
const youtube = google.youtube({
  version: "v3",
  auth: process.env.Google_API_KEY, // ✅ THIS is how you pass API key correctly
});

async function getSearchVideos(query = "apna college", pageToken = "") {
  // if (query == "apna college") return popularVideoData;
  try {
    // 🔹 1️⃣ Search all types together
    const search = await youtube.search.list({
      part: "snippet",
      q: query,
      type: "video,channel,playlist",
      maxResults: 50,
      pageToken,
      regionCode: "IN",
      fields: "nextPageToken,items(id/videoId,id/channelId,id/playlistId)",
    });

    const { items, nextPageToken } = search.data;
    // Collect IDs
    const videoIds = items.filter((i) => i.id.videoId).map((i) => i.id.videoId);

    const channelIds = items
      .filter((i) => i.id.channelId)
      .map((i) => i.id.channelId);
    const playlistIds = items
      .filter((i) => i.id.playlistId)
      .map((i) => i.id.playlistId);

    // 🔹 2️⃣ Fetch details for all types (in parallel)
    const [videos, channels, playlists] = await Promise.all([
      videoIds.length
        ? youtube.videos.list({
            part: "snippet,contentDetails,statistics",
            id: videoIds.join(","),
            fields:
              "items(id,snippet(title,channelTitle,publishedAt,thumbnails(medium,high,maxres)),contentDetails(duration),statistics(viewCount,likeCount))",
          })
        : { data: { items: [] } },

      channelIds.length
        ? youtube.channels.list({
            part: "snippet,statistics",
            id: channelIds.join(","),
            fields:
              "items(id,snippet(thumbnails(medium,high,maxres),title,publishedAt),statistics(viewCount,subscriberCount,videoCount))",
          })
        : { data: { items: [] } },

      playlistIds.length
        ? youtube.playlists.list({
            part: "snippet,contentDetails",
            id: playlistIds.join(","),
            fields:
              "items(id,snippet(channelTitle,thumbnails(medium,high,maxres),title,publishedAt),contentDetails(itemCount))",
          })
        : { data: { items: [] } },
    ]);

    // 🔹 3️⃣ Build a lookup map for each type
    const videoMap = new Map(
      videos.data.items.map((v) => [v.id, { ...v, type: "video" }])
    );
    const channelMap = new Map(
      channels.data.items.map((c) => [c.id, { ...c, type: "channel" }])
    );
    const playlistMap = new Map(
      playlists.data.items.map((p) => [p.id, { ...p, type: "playlist" }])
    );

    // 🔹 4️⃣ Merge everything into one unified array, preserving search order
    const mergedResults = items
      .map((item) => {
        if (item.id.videoId) return videoMap.get(item.id.videoId);
        if (item.id.channelId) return channelMap.get(item.id.channelId);
        if (item.id.playlistId) return playlistMap.get(item.id.playlistId);
      })
      .filter(Boolean);

    // 🔹 5️⃣ Render in EJS
    return { nextPageToken, items: mergedResults };
  } catch (err) {
    console.error("YouTube API Error:", err);
    return { message: "Error fetching YouTube data." };
  }
}
module.exports = { getSearchVideos };
