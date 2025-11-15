//   fetching suggested videos

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;


const fetch = require('node-fetch');

async function getSuggestedVideos(videoId, pageToken) {
    const suggestedData_Url =
        `f`;
    // `https://youtube-data8.p.rapidapi.com/video/related-contents/?id=${videoId}&timestamp=${Date.now()}&rapidapi-key=${RAPIDAPI_KEY}`;

    if (pageToken)
        suggestedData_Url = suggestedData_Url + "&pageToken=" + pageToken;

    const res = await fetch(suggestedData_Url);
    if (!res.ok) throw new Error('Failed to fetch suggested videos');
    return await res.json();
}

module.exports = { getSuggestedVideos };
