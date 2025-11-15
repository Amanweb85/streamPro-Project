// import { popularVideoData } from "/dist/js/ApiData/popularvideo.js";

// search/index.js

const banner = document.querySelector(".banner");
const videoArea = document.querySelector(".video-area");
const vidCategory = document.querySelector(".vid-category");
console.log("hii");
// window.location.href = `/download`

//remove banner
document
  .querySelector(".banner .remove-banner")
  .addEventListener("click", () => {
    banner.style.display = "none";
  });

// *************************************************    auto writing effect      ************************************************ //

// -------------------------- left-panel shortcut active------------------------------

document.querySelectorAll(".shortcuts a").forEach((elem, ind, arr) =>
  elem.addEventListener("click", (e) => {
    arr.forEach((elm) => {
      if (
        [...elm.classList].some((className) => {
          return className === "active";
        })
      )
        elm.classList.remove("active");
    });
    elem.classList.add("active");
    if (e.currentTarget.id == "library") {
      fetchSavedVideosFromDB();
    }
    if (e.currentTarget.id == "playlists") {
      fetchPlaylistsFromDB();
    }
  })
);

//*************** getting videos from DB ************** */
async function fetchSavedVideosFromDB() {
  shimmerEffect();
  try {
    fetch(`/api/user/video`)
      .then((response) => response.json())
      .then((data) => {
        console.log("fetched data successfully:", data);
        setTimeout(() => displayData({ items: data }), 1000);
      });
  } catch (err) {
    console.log("failed to save video : ", err.message);
  }
}
async function fetchPlaylistsFromDB() {
  shimmerEffect();
  try {
    fetch(`/api/user/playlists`)
      .then((response) => response.json())
      .then((data) => {
        console.log("fetched data successfully:", data);
        setTimeout(() => displayData({ items: data }), 1000);
      });
  } catch (err) {
    console.log("failed to save video : ", err.message);
  }
}

//          ****************************  searching and displaying data using fetch Api [googleapis]  ****************************

function searchAndDisplayDataUsingGoogleApis() {
  getSearchData();

  // ---------------searching Data---------------

  async function getSearchData() {
    await fetch(`/api/search?searchQuery=${CommonUtils.searchKeyword}`)
      .then((response) => response.json())
      .then((data) => {
        // if search data is not fetched successfully < in case of quota full >
        if (data.error?.errors[0].message) {
          // displayData(popularVideoData);
          console.log(
            data.error?.errors[0].message,
            "\nfetchedSearchData is ",
            data
          );
        } else {
          console.log("Data successfully fetched :", data);
          displayData(data);
        }
      })
      // handeling error
      .catch((error) => {
        console.log("error occurred in searching Data :", error);
      });
  }
}

// -------------------displaying data ---------------------
// videoArea.innerHTML = "";
export function displayData(data) {
  videoArea.innerHTML = "";
  data.items.forEach((item, idx) => {
    if (item.type === "channel") {
      displayChannel(item, idx);
    } else if (item.type === "playlist") {
      displayPlaylist(item, idx);
    } else {
      displayVideo(item, idx);
    }
  });
}

//-----displaying channel------

function displayChannel(item, idx) {
  const channelBox = document.createElement("div");
  channelBox.classList.add("channel", "flex-box");
  channelBox.id = item.id;
  channelBox.innerHTML = `
          <a class="channel-image-box flex-box">
            <img class="channel-image" src="${
              item.snippet.thumbnails.maxres?.url ||
              item.snippet.thumbnails.high?.url ||
              item.snippet.thumbnails.medium?.url
            }">
          </a>
          <a class="channel-details flex-box">
            <h2 class="channel-title">${item.snippet.title}</h2>
            <p class="subscriber" data-subscriber-count=${
              item.statistics.subscriberCount
            }>${CommonUtils.changeFormate(
    item.statistics.subscriberCount
  )} subscribers</p>
          </a>
          <a class="subscribe-button">Subscribe</a>`;

  videoArea.append(channelBox);
}

//-----displaying Playlist-----

function displayPlaylist(item, idx) {
  const vidBox = document.createElement("a");
  vidBox.classList.add("playlist", "vid-box");
  vidBox.id = item.id;
  vidBox.href = `/watch?listId=${item.id}`;
  vidBox.innerHTML = `
      <div class="thumbnail-container">
        <img class="thumbnail" style="object-fit: cover;width:100%" src=${
          item.snippet.thumbnails.maxres?.url ||
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url
        } alt="thumbnail" > 
        <div class="play-icon-container">
          <img class="play-icon" src="/dist/images/icon-play.png">
        </div>
        <p class="playlist-itemCount" data-item-count=${
          item.contentDetails.itemCount
        }>
          <img src="https://cdn-icons-png.flaticon.com/128/4043/4043804.png" width="12px" alt="playlist icon"> &nbsp;
          <span> ${item.contentDetails.itemCount}</span>&nbsp;videos
        </p>
      </div>
      <div class="vid-details">
        <div>
          <div class="vid-title"><p>${item.snippet.title}</p></div>
          <h4 class="channel-title">${item.snippet.channelTitle}</h4>
          <div class="views-time-container">
            <img class="time-icon" src="/dist/images/icon-time.png">&nbsp;
            <span class="published-duration" data-published-at=${
              item.snippet.publishedAt
            }> ${CommonUtils.changeTimeFormate(
    item.snippet.publishedAt
  )} </span>
          </div>
        </div>
        <span class="three-dots"> &#8942;</span>
      </div>`;

  videoArea.append(vidBox);
}
//-----displaying video-----

function displayVideo(item, idx) {
  const vidBox = document.createElement("a");
  vidBox.classList.add("video", "vid-box");
  vidBox.href = `/watch?id=${item.id.videoId || item.id}`;
  vidBox.id = item.id;
  vidBox.innerHTML = `
    <div class="thumbnail-container">
       <img class="thumbnail" src=${
         item.snippet.thumbnails.maxres?.url ||
         item.snippet.thumbnails.high?.url ||
         item.snippet.thumbnails.medium.url
       }  alt=" thumbnail"> 
      <div class="play-icon-container">
        <img class="play-icon" src="/dist/images/icon-play.png">
      </div>
      <p class="vid-duration"  data-duration=${item.contentDetails?.duration}>${
    item.contentDetails?.duration
      ? CommonUtils.changeVidDurationFormat(
          item.contentDetails?.duration
            .replace("PT", "")
            .replace("S", "")
            .split("M")
            .reduce((a, val) => parseInt(a) * 60 + parseInt(val), 0)
        )
      : ""
  }</p>
    </div> 
    <div class="vid-details">
      <div>
        <div class="vid-title"><p>${item.snippet.title}</p></div>
        <h4 class="channel-title">${item.snippet.channelTitle}</h4>
        <div class="views-time-container">
          <img class="eye-icon" src="/dist/images/icon-eye.png">&nbsp;<span class="views" data-view-count=${
            item.statistics?.viewCount
          }>${CommonUtils.changeFormate(
    item.statistics?.viewCount || 89
  )}</span>  &nbsp;&nbsp;
          <img class="time-icon" src="/dist/images/icon-time.png">&nbsp;<span class="published-duration" data-published-at=${
            item.snippet?.publishedAt
          }> ${CommonUtils.changeTimeFormate(item.snippet.publishedAt)} </span>
        </div>
      </div>
      <span class="three-dots"> &#8942;</span>
    </div>`;

  videoArea.append(vidBox);
}
//

// -------------------------- vid-category shortcut active------------------------------

document.querySelectorAll(".vid-category div").forEach((elem, ind, arr) =>
  elem.addEventListener("click", () => {
    arr.forEach((elm) => {
      if (
        [...elm.classList].some((className) => {
          return className === "active";
        })
      )
        elm.classList.remove("active");
    });
    elem.classList.add("active");
    getCategoryData(elem.id);
  })
);

async function getCategoryData(categoryId) {
  shimmerEffect();
  try {
    const res = await fetch(`api/category?categoryId=${categoryId}`);
    const data = await res.json();
    // if (!data || !data.data) return; // check null
    displayData(data);
  } catch (err) {
    console.log(err);
    videoArea.innerText = "";
  }
}

function shimmerEffect() {
  videoArea.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    videoArea.innerHTML += `<a class="vid-box" style="aspect-ratio: 286 / 277;"></a>`;
  }
}
window.shimmerEffect = shimmerEffect;
