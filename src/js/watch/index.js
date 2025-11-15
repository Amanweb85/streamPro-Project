export const body = document.querySelector("body");
const leftPanel = document.querySelector(".left-panel");
const rightPanel = document.querySelector(".right-panel");

// showing more description

document
  .querySelector(".show-more-description")
  .addEventListener("click", () => {
    const isSmallDescription = document
      .querySelector(".video-description")
      .classList.toggle("small-video-description");
    if (isSmallDescription)
      document.querySelector(".show-more-description").innerText =
        "Show More ...";
    else
      document.querySelector(".show-more-description").innerText =
        "Show Less ...";
  });

// -------------------collapse left panel when click on body ----------------------

body.addEventListener("click", (e) => {
  leftPanel.classList.add("narrow-panel");
});

leftPanel.addEventListener("click", (e) => {
  e.stopPropagation();
});

// ***********************  searching and displaying suggested video data realated to currently playing video using RapidApi ***********************

function searchAndDisplaySuggestedVideoDataUsingRapidApi() {
  getSuggestedVideoData();

  // -------searching data ------

  async function getSuggestedVideoData() {
    console.log("getting suggested Data");
    await fetch(`/api/suggestedVideos?videoId=${id}`)
      .then((response) => response.json())
      .then((data) => {
        //if search data is successfully fetched
        console.log("\nSuggested Data successfully fetched", data);
        // data.length ? displaySuggestedVideoData(data) : displaySuggestedVideoData(suggestedDataRapidApi);
      })
      // handeling error
      .catch((error) => {
        // displaySuggestedVideoData(suggestedDataRapidApi);
        console.log("\nAAAAAA error occurred in suggestedData ", error);
      });
  }

  // ------displaying Data-------

  function displaySuggestedVideoData(data) {
    data.items.forEach((item, idx) => {
      const vidBox = document.createElement("a");
      vidBox.classList.add("vid-box", "video");
      vidBox.id = "id" + item.id.videoId;
      vidBox.href = `/watch?id=${item.id.videoId} `;
      vidBox.innerHTML = `
        <div class="thumbnail-container" id = "${item.id.videoId} ">
          <img class="thumbnail" style="object-fit: cover;width:100%"src=${
            item.snippet.thumbnails.medium.url
          }>
          <div class="play-icon-container"><img class="play-icon" src="/dist/images/icon-play.png"></div> 
        </div >
        <div class="vid-details flex-box">
          <div>
            <div class="vid-title"><p>${item.snippet.title}</p></div>
            <h4 class="channel-title">${item.snippet.channelTitle}</h4>
            <div class="views-time-container">
              <img class="eye-icon" src="/dist/images/icon-eye.png">&nbsp;<span class="views">none</span>  &nbsp;&nbsp;
              <img class="time-icon" src="/dist/images/icon-time.png">&nbsp;<span class="published-duration"> ${CommonUtils.changeTimeFormate(
                item.snippet.publishTime
              )} </span>
            </div>
          </div>
          <span class="three-dots">&#8942;</span>
        </div>`;
      rightPanel.append(vidBox);
    });
  }
}

// ----  adding new comment ----

document
  .querySelector(".write-comment textarea")
  .addEventListener("input", (e) => {
    if (e.target.value) {
      document.querySelector(".post-comment").classList.remove("disabled");
    } else {
      document.querySelector(".post-comment").classList.add("disabled");
    }
  });

document.querySelector(".post-comment").addEventListener("click", (e) => {
  e.target.classList.add("disabled");

  const comment = document.createElement("div");
  comment.className = "comment1";
  comment.innerHTML = `<img src = "/dist/images/procodrr.jpg" />
      <div class="comment-content" >
        <div class="comment-head flex-comment">
          <h4 class="comment-author-name">Aman Verma</h4>
          <span>${CommonUtils.changeTimeFormate(Date())}</span>
        </div>
        <p>${document.querySelector(".write-comment textarea").value}</p>
        <div class="comment-action flex-comment">
          <img alt="" src="/dist/images/like.svg"><p>0</p>
          <img alt="" src="/dist/images/dislike.svg"><p>0</p>
        </div>
      </div> `;
  document.querySelector(".write-comment").after(comment);

  document.querySelector(".write-comment textarea").value = "";
});

//----subscribe-box----

document
  .querySelector(".subscribe-box button")
  .addEventListener("click", (e) => {
    if (e.target.innerText == "Follow") {
      e.target.innerText = "Following";
      e.target.style.opacity = ".5";
    } else {
      e.target.innerText = "Follow";
      e.target.style.opacity = "1";
    }
  });

//*********************************************  searching and displaying comments of Playing Video  *********************************************

let commentDataNextPageToken = "";

function searchAndDisplayCommentDataUsingGoogleApis(pageToken = "") {
  searchCommentData();

  //------searching comments of playing video-----

  function searchCommentData() {
    try {
      fetch(`/api/comments?videoId=${id}&pageToken=${pageToken}`)
        .then((response) => response.json())
        .then((data) => {
          // if search data is not fetched successfully < in case of quota full >
          if (data.error?.errors[0].message) {
            displayCommentData({});
            console.log(
              data.error?.errors[0].message,
              "\nfetched Comment Data is ",
              data
            );
          }
          //if search data is successfully fetched
          else if (data) {
            console.log("Comment Data successfully fetched", data);
            commentDataNextPageToken = data.nextPageToken;
            displayCommentData(data);
          }
        })
        // handeling error
        .catch((error) => {
          console.log("\nAAAAAA comment error occurred ", error);
          displayCommentData({});
        });
    } catch (err) {
      console.log(err);
    }
  }

  // -------displaying comments----------------
  function displayCommentData(commentData) {
    console.log("commentData is:", commentData);
    if (Object.keys(commentData).length === 0) return;
    const pageCount = document.querySelector(".comment-count").innerText;
    document.querySelector(".comment-count").innerText =
      Number(pageCount) + commentData.pageInfo.totalResults;
    commentData.items.forEach((data) => {
      const comment = document.createElement("div");
      comment.className = "comment1";
      comment.innerHTML = `<img src = "${
        data.snippet.topLevelComment.snippet.authorProfileImageUrl
      }" />
      <div class="comment-content" >
        <div class="comment-head flex-comment">
          <h4 class="comment-author-name">${
            data.snippet.topLevelComment.snippet.authorDisplayName
          }</h4>
          <span>${CommonUtils.changeTimeFormate(
            data.snippet.topLevelComment.snippet.publishedAt
          )}</span>
        </div>
        <p class="commentData"></p>
        <div class="comment-action flex-comment">
          <img alt="" src="/dist/images/like.svg"><p>${
            data.snippet.topLevelComment.snippet.likeCount || 0
          }</p>
          <img alt="" src="/dist/images/dislike.svg"><p>0</p>
        </div>
      </div> `;
      comment.querySelector(".commentData").innerHTML =
        data.snippet.topLevelComment.snippet.textDisplay;
      document.querySelector(".comment-container").append(comment);
    });
  }
}

// more comments
document.querySelector(".more-comments").addEventListener("click", () => {
  searchAndDisplayCommentDataUsingGoogleApis(commentDataNextPageToken);
});

// *************************************** fetching video info from server **********************************

// *********** fetching videoDetails from server ************
//
const { id, listId } = __APP_DATA__;
let url = id
  ? `https://youtu.be/${id}`
  : `https://youtu.be/${sessionStorage.getItem("id")}?list=${listId}`;

fetchAndDisplayvideoDetails(url);
function fetchAndDisplayvideoDetails(url) {
  try {
    fetch(`/api/videoDetails?videoUrl=${url}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("video Details : ", data);
        displayPlayingVideoinfo(data);
        window.addEventListener("beforeunload", (e) => {
          saveVideoToHistory(data);
        });
      })
      .catch((err) => console.log("Fetch error:", err));

    function displayPlayingVideoinfo(videoDetails) {
      document.querySelector(
        ".left-video-container .video-title h3"
      ).innerText = videoDetails.title;
      document.querySelector(
        ".left-video-container .video-title .category"
      ).innerText = videoDetails.category;
      console.log("category", videoDetails.category);
      document.querySelector(".view-count").innerText =
        CommonUtils.changeFormate(videoDetails.viewCount);
      document.querySelector(".time").innerText = CommonUtils.changeTimeFormate(
        videoDetails.uploadDate
      );
      document.querySelector(".like-count").innerText =
        CommonUtils.changeFormate(videoDetails.likeCount);
      document.querySelector(".channel-name").innerText =
        videoDetails.ownerChannelName;

      document.querySelector(".channel-author").src =
        videoDetails.author.thumbnails.at(-1).url;

      document.querySelector(".subscriber-count").innerText =
        CommonUtils.changeFormate(videoDetails.author.subscriber_count);

      document.querySelector(".video-description div").innerHTML =
        getVideoDescription(videoDetails.description);
    }

    function getVideoDescription(description) {
      if (!description) return "";

      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

      return description
        .split(/\n\s*\n/) // Split text into paragraphs
        .filter((block) => block.trim() !== "") // Remove empty paragraphs
        .map((block) => {
          const content = block
            .trim()
            .replace(urlRegex, (match) => {
              let href = match;
              if (match.startsWith("www.")) {
                href = "https://" + match;
              }

              // Convert YouTube links to internal format
              if (href.includes("youtube.com/watch?v=")) {
                href = `/watch?id=${new URL(href).searchParams.get("v")}`;
              } else if (href.includes("youtu.be/")) {
                href = `/watch?id=${new URL(href).pathname.substring(1)}`;
              }

              return `<span><a href="${href}">${match}</a></span>`;
            })
            .replace(/\n/g, "<br>"); // Convert single newlines to line breaks

          return `<p>${content}</p>`;
        })
        .join("");
    }

    // logic for getting correct resolution of thumbnail
    function convertThumbnails(thumbnails) {
      const typeMapping = {
        mqdefault: "medium",
        hqdefault: "high",
        maxres: "maxres",
        hq2: "high",
      };
      const result = thumbnails.reduce((acc, t) => {
        const typeKey = Object.keys(typeMapping).find((key) =>
          t.url.includes(key)
        );
        if (typeKey) acc[typeMapping[typeKey]] = { url: t.url.split("?")[0] };

        return acc;
      }, {});

      return result;
    }

    // saving video in the user's history
    function saveVideoToHistory(video) {
      historyVideo = {
        type: "video",
        id: video.videoId,
        snippet: {
          channelTitle: video.ownerChannelName,
          title: video.title,
          thumbnails: convertThumbnails(video.thumbnails),
          publishedAt: video.publishDate,
        },
        contentDetails: {
          duration: video.lengthSeconds,
        },
        statistics: {
          viewCount: video.viewCount,
          likeCount: video.likeCount,
        },
        seekTime: seekTime,
      };

      //saving video to history
      try {
        const response = fetch(`/api/user/history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "historyVideo",
            video: historyVideo,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Data saved to history", data);
            // Now you can update your page with the data.
          });
      } catch (err) {
        console.log("failed to save to history : ", err.message);
      }
    }
  } catch (err) {
    console.log(err);
  }
}
