import "./services/websocketManager.js";

const urlParams = new URLSearchParams(window.location.search); // gives the object(urlParams) of paramenters passing in url
export let searchKeyword = urlParams.get("sq") || "";
export let categoryQuery = urlParams.get("q");

const body = document.querySelector("body");
const menuIcon = document.querySelector("#menu-icon");
const accPopup = document.querySelector(".acc-popup");
const appearancePopup = document.querySelector(".appearance-popup");
const languagePopup = document.querySelector(".language-popup");
const locationPopup = document.querySelector(".location-popup");
const leftPanel = document.querySelector(".left-panel");
const optionListBox = document.querySelector(".option-listbox");
const downloadMetadataContainer = document.querySelector(
  ".download-metadata-container"
);
let selectedVideoData;

// ---------------theme ----------------
let theme = localStorage.theme || "dark";
body.className = "";

if (theme == "light") {
  body.className == "";
} else if (theme == "dark") {
  body.className = "dark";
} else if (theme == "dark-image-backed") {
  body.className = "image-backed dark";
} else {
  body.className = "image-backed";
}

// ------- left panel Menu Bar--------

menuIcon.addEventListener("click", (e) => {
  e.stopPropagation();
  leftPanel.classList.toggle("narrow-panel");
});

//            ************************************************  Popups ***********************************************************

function showAccPopup() {
  accPopup.classList.add("show-popup");
}
function hideAccPopup() {
  accPopup.classList.remove("show-popup");
}
function showAppearancePopup() {
  appearancePopup.classList.add("show-popup");
}
function hideAppearancePopup() {
  appearancePopup.classList.remove("show-popup");
}
function showLocationPopup() {
  locationPopup.classList.add("show-popup");
}
function hideLocationPopup() {
  locationPopup.classList.remove("show-popup");
}
function showLanguagePopup() {
  languagePopup.classList.add("show-popup");
}
function hideLanguagePopup() {
  languagePopup.classList.remove("show-popup");
}
function hideOptionListbox() {
  optionListBox?.classList.remove("show-option-listbox");
}
function showoptionListbox(e) {
  var mouseX = e.pageX;
  var mouseY = e.pageY;
  optionListBox.style.left = mouseX + "px";
  optionListBox.style.top = mouseY + "px";
  optionListBox.classList.add("show-option-listbox");
}
function FlashSuccessMessage(message) {
  console.log("fflashing message");
  const flashMessageElem = document.querySelector(".flash-message");
  flashMessageElem.innerText = message;
  flashMessageElem?.classList.remove("hide-flash-message");
  flashMessageElem?.classList.add("success-msg");
  setTimeout(() => {
    flashMessageElem?.classList.add("hide-flash-message");
  }, 1000);
}

// --------------------  remove popups when click on body  ----------------------

body.addEventListener("click", (e) => {
  hideAccPopup();
  hideLocationPopup();
  hideLanguagePopup();
  hideAppearancePopup();
  hideOptionListbox();
});

//-------- getting video details of selected video--------------

body.addEventListener("click", (e) => {
  if (e.target.className == "three-dots") {
    e.preventDefault();
    showoptionListbox(e);

    let elem = e.target;
    // Climb up until we find the parent with class "vid-box"
    while (elem && !elem.classList.contains("vid-box")) {
      elem = elem.parentElement;
    }
    // getting elements of selected vid-box by their className

    if (!elem.id) return;

    function getElement(className) {
      return elem.querySelector(` .${className}`);
    }

    // logic for getting correct resolution of thumbnail
    const src = getElement("thumbnail").src;
    const map = {
      maxresdefault: "maxres",
      hqdefault: "high",
      mqdefault: "medium",
    };
    const key = Object.keys(map).find((k) => src.includes(k));
    const thumbnails = { [map[key]]: { url: src } };

    // storing details of selected vid-box in 'selectedVideoData' object
    selectedVideoData = {
      type: elem.classList[0],
      id: elem.id,
      snippet: {
        channelTitle: getElement("channel-title")?.innerText,
        title: getElement("vid-title").innerText,
        thumbnails,
        publishedAt: getElement("published-duration").dataset.publishedAt,
      },
      contentDetails: {
        ...(getElement("vid-duration")
          ? { duration: getElement("vid-duration").dataset.duration }
          : { itemCount: getElement("playlist-itemCount")?.dataset.itemCount }),
      },
      ...(elem.classList.contains("video") && {
        statistics: {
          viewCount: getElement("views").dataset.viewCount,
        },
      }),
    };
    console.log("selectedVideo", selectedVideoData);
  }
});

// hide optionsListBox on scroll

function showDownloadMetadataContainer() {
  downloadMetadataContainer.classList.add("show-download-metadata-container");
}
function hideDownloadMetadataContainer() {
  downloadMetadataContainer.classList.remove(
    "show-download-metadata-container"
  );
}

window.addEventListener("scroll", (e) => {
  hideOptionListbox();
  hideDownloadMetadataContainer();
});
document
  .querySelector(".download-metadata-container .go-back")
  .addEventListener("click", () => {
    hideDownloadMetadataContainer();
  });

//----- get Selected vid-box data ------------

optionListBox?.addEventListener("click", (e) => {
  if (e.target.className == "save-to-playlist") {
    store_saveVideoDataToDB(selectedVideoData);
  } else if (e.target.className == "download") {
    let id = selectedVideoData.id;

    const url = id
      ? `https://youtu.be/${id}`
      : `https://www.youtube.com/watch?list=${playlistId}`;

    showDownloadMetadataContainer();
    document.querySelector(".video-formats").innerHTML = "";
    const thumbnail = Object.values(selectedVideoData.snippet.thumbnails)[0]
      .url;
    const title = selectedVideoData.snippet.title;
    showMetadata(url, thumbnail, title);
    fetchFormatData(url);
  }
});

// --------------------------save playlist/like/watch-later video data in data base ----------------------------
// send save-to-playlist data in DB
async function store_saveVideoDataToDB(selectedVideoData) {
  try {
    const response = fetch(`/api/user/video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "savedVideos", video: selectedVideoData }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data saved:", data);
        FlashSuccessMessage(data.message);
        // Now you can update your page with the data.
      });
  } catch (err) {
    console.log("failed to save video : ", err.message);
  }
}

// ---------------------------------  account popup  ----------------------------

document.querySelector("#photo").addEventListener("click", (e) => {
  e.stopPropagation();
  console.log("toggling acc-popup show");
  accPopup.classList.toggle("show-popup");
});

accPopup.addEventListener("click", (e) => {
  e.stopPropagation(); //stops event propagation when it reach to popup container
});

document.querySelectorAll(".acc-popup a").forEach((elem) => {
  elem.addEventListener("click", (e) => {
    // console.log(elem.classList[0]);
    if (elem.classList.contains("appearance")) showAppearancePopup();
    else if (elem.classList.contains("language")) showLanguagePopup();
    else if (elem.classList.contains("location")) showLocationPopup();
    // e.stopPropagation();
    hideAccPopup();
  });
});

// --------------------------  appearance popup  ---------------------

appearancePopup.addEventListener("click", (e) => {
  body.style.transition =
    "background-color 0.7s ease-in,color 0.7s ease-in-out"; // changing the theme of body slowly

  if (
    e.target.parentElement.className === "dark-theme" ||
    e.target.className === "dark-theme"
  ) {
    hideAppearancePopup();
    hideAccPopup();
    theme = "dark";
    body.className = "dark";
  } else if (
    e.target.parentElement.className === "light-theme" ||
    e.target.className === "light-theme"
  ) {
    body.className = "";
    hideAppearancePopup();
    hideAccPopup();
    theme = "light";
  } else if (
    e.target.parentElement.className === "dark-image-backed" ||
    e.target.className === "dark-image-backed"
  ) {
    body.className = "";
    hideAppearancePopup();
    hideAccPopup();
    theme = "dark-image-backed";
    body.className = "image-backed dark";
  } else if (
    e.target.parentElement.className === "light-image-backed" ||
    e.target.className === "light-image-backed"
    // theme = "dark-image-backed";
  ) {
    hideAccPopup();
    hideAppearancePopup();
    // localStorage.theme = "light-image-backed";
    theme = "light-image-backed";
    body.className = "image-backed";
  } else if (e.target.className === "go-back") {
    hideAppearancePopup();
    showAccPopup();
  }
  localStorage.theme = theme;
  document.querySelector(
    ".acc-popup .appearance p"
  ).innerText = `Appearance: ${theme}`;

  e.stopPropagation();
});
document.querySelector(
  ".acc-popup .appearance p"
).innerText = `Appearance: ${theme}`;

// --------------------------language popup-----------------------------

languagePopup.addEventListener("click", (e) => {
  if (e.target.className === "go-back") {
    hideLanguagePopup();
    showAccPopup();
  }
  e.stopPropagation();
});

// --------------------------location popup-----------------------------

locationPopup.addEventListener("click", (e) => {
  if (e.target.className === "go-back") {
    hideLocationPopup();
    showAccPopup();
  }
  e.stopPropagation();
});

// //

// //    *********************************  search Video data functionality  ***********************************
const searchBox = document.querySelector(".search-box");
const searchIcon = document.querySelector("#search-icon");

setTimeout(() => {
  searchBox.value = searchKeyword || "";
}, 1);

// searching when we click on the search Icon
searchIcon.addEventListener("click", () => {
  if (searchBox.value) {
    window.location.href = `/search?sq=${searchBox.value}`; //redirecting to /search
  }
});
// searching when we presses enter key on the keyboard
searchBox.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchIcon.click();
  }
});

// ----------------------------converting views,likes counts in 1.2K and 2.1M formate  ----------------------

export function changeFormate(num) {
  let n = +num;
  if (n <= 999) {
    return `${n}`;
  } else if (n < 999999) {
    return `${parseInt((100 * n) / 1000) / 100}K`;
  } else if (n < 99999999) {
    return `${parseInt((100 * n) / 1000000) / 100}M`;
  } else {
    return `${parseInt((100 * n) / 10000000) / 100}cr`;
  }
}

//------------------------converting video_published_date in 2 days ago , 3 years ago... formate----------------

export function changeTimeFormate(time) {
  const timePassedObj = new Date(
    new Date().getTime() - new Date(time).getTime()
  );
  const passedYears = timePassedObj.getUTCFullYear() - 1970;
  const passedMonths = timePassedObj.getUTCMonth();
  const passedDays = Math.floor(timePassedObj.getTime() / 1000 / 60 / 60 / 24);
  const passedHours = timePassedObj.getUTCHours();

  if (passedYears) {
    return `${passedYears} years ago`;
  } else if (passedMonths) {
    return `${passedMonths} Month ago`;
  } else if (passedDays) {
    return `${passedDays} Days ago`;
  } else if (passedHours) {
    return `${passedHours} hours ago`;
  } else if (passedHours / 60) {
    return `${passedHours / 60} minutes ago`;
  } else {
    return `just now`;
  }
}

//-------------------------------converting seconds in min:sec formate (23:03)--------------------------------------

export function changeVidDurationFormat(seconds) {
  function formatData(data) {
    if (data < 10) return `0${data}`;
    else return data;
  }

  const date = new Date(seconds * 1000);
  if (date.getUTCHours()) {
    return `${date.getUTCHours()}:${formatData(
      date.getUTCMinutes()
    )}:${formatData(date.getUTCSeconds())}`;
  } else if (date.getUTCMinutes()) {
    return `${formatData(date.getUTCMinutes())}:${formatData(
      date.getUTCSeconds()
    )}`;
  } else {
    return `00:${formatData(date.getUTCSeconds())}`;
  }
}

// ------------------- getting metadata of video  ------------------------

// copy video url when click on copy-btn
document.querySelector(".url-copy-btn").addEventListener("click", async (e) => {
  const url = document.querySelector(
    "#download-form .download-url-input"
  ).value;
  try {
    await navigator.clipboard.writeText(url);
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
  e.target.innerText = "Copied!";
  e.target.classList.add("download-url-copied");

  setTimeout(() => {
    e.target.innerText = "Copy";
    e.target.classList.remove("download-url-copied");
  }, 10000);
});

//fetching available video formats from server
function fetchFormatData(url) {
  fetch(`/api/videoFormats?videoUrl=${url}`)
    .then((res) => res.json())
    .then((formats) => showFormats(formats))
    .catch((err) => {
      console.dir(err);
    });
}
function showFormats(formats) {
  document.querySelector(".video-formats").innerHTML = "";
  formats.forEach((format, idx) => {
    const label = document.createElement("label");
    label.classList.add("container", "format");
    label.innerHTML = `<p class="quality"><span style="font-size: 10px;">${
      format.containerType
    }</span><br> ${format.quality}p</p>
                      <p class="size">${format.size}</p>
                      <input type="radio" ${
                        idx == 0 ? "checked" : ""
                      } name="qualityLabel" value="${format.quality},${
      format.containerType
    }">
                      <span class="checkmark"></span>`;
    document.querySelector(".video-formats").append(label);
  });
}

function showMetadata(url, thumbnail, title) {
  document.querySelector("#download-form .download-url-input").value = url;
  document.querySelector(".metadata-container .video-title ").innerText = title;
  document.querySelector(".metadata-container .thumbnail").src = thumbnail;
}

// ******************* downloading video ************************

import WebSocketManager from "./services/websocketManager.js";

// connecting websocket with prev sessionId or generate new
let sessionId =
  sessionStorage.sessionId || "user-" + Math.random().toString(36).substring(2);
sessionStorage.sessionId = sessionId;

const wsManager = new WebSocketManager(sessionId);
wsManager.connect();

// // exposing wsManager object globally
// window.wsManager = wsManager;

//*********************************************************** */

function createProgressCard(videoUrl) {
  console.log("creating new progress card");
  const card = document.createElement("div");
  card.id = `progressCard-/${videoUrl}/`;
  card.className = "card";
  card.innerHTML = `
                  <p class="status-message">Getting video information...</p>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: 0%;"></div>
                        </div>
                        <div class="flex ">
                        <p class="progress-text">0%</p>
                        <a class="cancel-download-btn">Cancel</a>
                    </div>
               `;
  document.querySelector(".download-area").appendChild(card);
}
// createProgressCard('data.url');
// createProgressCard('data.url');
// createProgressCard('data.url');
// createProgressCard('data.url');
// createProgressCard('data.url');
// createProgressCard('data.url');

document
  .querySelector("#download-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    // Convert all entries to a plain object
    const allFormValues = Object.fromEntries(formData.entries());
    const { videoUrl, qualityLabel } = allFormValues;
    const [quality, extension] = qualityLabel.split(",");
    document
      .querySelector(".download-metadata-container")
      .classList.remove("show-download-metadata-container");

    try {
      const response = fetch(`/api/downloadVideo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, quality, extension, sessionId }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Data received:", data);
          // Now you can update your page with the data.
        });
    } catch (err) {
      console.log("Download request failed: ", err.message);
    }

    // const downloadLink = document.createElement("a");
    // downloadLink.href = `/api/startDownloadStream?videoUrl=${encodeURIComponent(
    //   videoUrl
    // )}&quality=${quality}&extension=${extension}&sessionId=${sessionId}`;
    // const body = document.querySelector("body");
    // downloadLink.download = `${selectedVideoData.snippet.title}.${extension}`;
    // body.appendChild(downloadLink);
    // downloadLink.click();
    // URL.revokeObjectURL(downloadLink);
    // body.removeChild(downloadLink);
  });

// ******************************************* chat-bot container ******************************************

const chatBotContainer = document.querySelector(".chat-bot-container");
const chatBotInputElem = document.querySelector(".chat-bot-input");
const chatArea = document.querySelector(".chat-area");

document.querySelector(".chat-bot-button").addEventListener("click", () => {
  chatBotContainer.classList.toggle("show-chat-bot-container");
});

chatBotInputElem.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.querySelector(".send-btn").click();
  }
});

chatBotContainer.addEventListener("click", (e) => {
  if (e.target.className == "cancel-btn") {
    chatBotContainer.classList.remove("show-chat-bot-container");
  }

  if (
    e.target.className == "send-btn" ||
    e.target.parentElement.className == "send-btn"
  ) {
    document.querySelector(".default-msg").style.display = "none";
    let userText = chatBotInputElem.value.trim();
    chatBotInputElem.value = "";

    if (userText) {
      createUserChat(userText);
      sendMessage(userText).then(() => {
        chatArea.scrollTo({
          top: chatArea.scrollHeight,
          // behavior: 'smooth'
        });
      });
      chatArea.scrollTo({
        top: chatArea.scrollHeight,
      });
    }
  }
});
function createUserChat(userText) {
  const userChat = document.createElement("div");
  userChat.className = "user-msg";
  userChat.innerText = userText;
  chatArea.append(userChat);
  console.log(userChat);
}
function createChatBotReply(chatBotReply) {
  const replyChat = document.createElement("div");
  replyChat.className = "reply";
  replyChat.innerText = chatBotReply;
  chatArea.append(replyChat);
}

// AI intigration

// Storing the conversation history in an array.

let conversationHistory = [];

async function sendMessage(userText) {
  conversationHistory.push({ role: "user", content: userText });
  createChatBotReply("Thinking...");

  try {
    const response = await fetch(`/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Send the user's message and any previous messages for context
        messages: conversationHistory,
      }),
    });
    // Handle non-successful HTTP responses
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const chatBotReply = data?.text || "Sorry, I couldn’t understand that.";
    [...document.querySelectorAll(".reply")].pop().innerText = chatBotReply;
    conversationHistory.push({ role: "assistant", content: chatBotReply });
  } catch (error) {
    console.error("Error:", error);
    ([...document.querySelectorAll(".reply")].pop().innerText =
      "Oops! Something went wrong. Please try again later. 😥"),
      "assistant";
  }
}
