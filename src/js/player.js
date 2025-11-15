// NOTE **  ||__iframe Api does not work in modules__||

const urlParams = new URLSearchParams(window.location.search); // gives the object(urlParams) of paramenters passing in url
console.log(window.__APP_DATA__);
let { id, listId, seekTo } = window.__APP_DATA__;

//*************************  playing video using Iframe API  ************************************  */

const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// loading the IFrame Player API code asynchronously
try {
  // creting an <iframe> (and YouTube player) after the API code downloads.
  var player;
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("player", {
      // // height: "100%",
      // width: "640",
      videoId: id || "dQw4w9WgXcQ",

      // customizing the player
      playerVars: {
        rel: 0,
        modesbranding: 1,
        playsinline: 1,
        list: listId,
        autoplay: 1,
        iv_load_policy: 3, // Hide video annotations
        loop: 1,
        // mute: 1,
        controls: 1,
        enablejsapi: 1,
        disablekb: 0,

        // playlist: "frZkjz9MaWg,UNuBKZoinDI,LhRfkaMp7g0",
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onPlaybackRateChange: onPlayerPlaybackRateChange,
      },
    });
  };
  function onPlayerReady(event) {
    // maintaining playback speed as it was in previous video

    if (seekTo) {
      console.log("seekIng to", seekTo);
      player.seekTo(seekTo, true);
      // setTimeout(() => player.seekTo(seekTo, true), 1500);
    }

    player.setPlaybackRate(+sessionStorage.playbackSpeed);
  }

  function onPlayerStateChange(event) {
    console.log("Player state changed to: " + event.data);
    //getting playing video url parameters when state is unstarted(-1)
    if (event.data == -1) {
      sessionStorage.id = id;
    } else if (event.data == 1) {
      document.querySelector(".video-title h3").innerText = player.videoTitle;
      document.querySelector(".channel-name").innerText =
        player.getVideoData().author;
      sessionStorage.id = player.getVideoData().video_id;
    }
  }
  function onPlayerPlaybackRateChange() {
    sessionStorage.playbackSpeed = player.getPlaybackRate();
  }
} catch (err) {
  console.log(err);
}

// saving player state before refresh

window.addEventListener("beforeunload", (e) => {
  window.seekTime = player.getCurrentTime();
});
