setTimeout(() => {
  console.log("hello");
  document.querySelector(".flash-message")?.classList.add("hide-flash-message");
}, 2000);

const elm = document.querySelector(".banner span");
const words = [
  "Movies.",
  "TV shows.",
  "Lectures.",
  "Songs.",
  "Live Streams.",
  "and more.",
];

function autoTyping(elm, wordList) {
  let reverseMode = true;
  let delay = 2;
  let wordIndex = -1;
  const timerId = setInterval(() => {
    // until delay not complete
    if (delay) {
      delay--;
      return;
    }

    // OFF the reverseMode and move to next word ,when innerText is removed completely
    if (elm.innerText.length === 0 && reverseMode) {
      reverseMode = false;
      wordIndex = (wordIndex + 1) % wordList.length;
      delay = 2;
      return;
    }

    // start reverseMode when word is written completely and wait for some time
    if (elm.innerText.length === wordList[wordIndex].length && !reverseMode) {
      reverseMode = true;
      delay = 6;
      return;
    }

    // writing the word, when reverseMode is off
    if (!reverseMode) {
      //space chracter is ignored in innerText of html element ,when space is the end character of the word (ex - "sports " will be considered as "sports") . that's why we write the space ,and next character at same time
      if (wordList[wordIndex][elm.innerText.length] === " ") {
        elm.innerText = wordList[wordIndex].slice(0, elm.innerText.length + 2);
        delay = 2;
      } else {
        elm.innerText = wordList[wordIndex].slice(0, elm.innerText.length + 1);
        // console.log( wordList[wordIndex].slice(0, elm.innerText.length + 1),elm.innerText.length + 1)
        delay = 2;
      }
    }
    if (reverseMode) {
      elm.innerText = elm.innerText.slice(0, elm.innerText.length - 1);
    }
  }, 60);
}
if (elm) {
  autoTyping(elm, words);
}
