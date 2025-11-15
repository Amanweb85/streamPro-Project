export default class WebSocketManager {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.ws = null;
    this.progressCards = new Map(); // Track progress cards by video URL
    this.body = document.body;
  }

  connect() {
    this.ws = new WebSocket(
      `ws://${window.location.host}?sessionId=${this.sessionId}`
    );

    this.ws.onopen = () => {
      console.log("Connected to websocket server.");
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.ws.onclose = () => {
      console.log("Disconnected from websocket server.");
      document.querySelector(".download-area").removeChild = "";
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  // -------------handlers for events -----------

  handleMessage(event) {
    const data = JSON.parse(event.data);
    // console.log(data);
    // Create progress card if it doesn't exist and data.url exists
    if (data.url && !this.progressCards.has(data.url)) {
      this.createProgressCard(data.url);
      return; // Wait for next message to update UI
    }

    const progressCard = this.progressCards.get(data.url);

    switch (data.type) {
      case "reconnected":
        console.log("Reconnected successfully");
        break;

      default:
        if (data.type == "start") console.log(data.videoName);
        if (data.videoName) {
          console.log(data.videoName);
          const statusMessage = progressCard.querySelector(".status-message");
          statusMessage.textContent = data.videoName;
          return;
        }
        if (data.type === "progress" && progressCard) {
          const progressBar = progressCard.querySelector(".progress-bar");
          const progressText = progressCard.querySelector(".progress-text");
          progressBar.style.width = `${data.progress}%`;
          progressText.textContent = `${data.progress.toFixed(2)}% of ${
            data.size
          } at ${data.speed}`;
          return;
        }

        if (data.type === "complete" && progressCard) {
          if (data.downloadUrl) {
            const downloadLink = document.createElement("a");
            downloadLink.href = data.downloadUrl;
            downloadLink.download = data.title;
            this.body.appendChild(downloadLink);
            downloadLink.click();
            URL.revokeObjectURL(downloadLink);
            this.body.removeChild(downloadLink);
          }
          progressCard.querySelector(".status-message").textContent =
            "Download Complete!";
          setTimeout(() => {
            progressCard.parentNode.removeChild(progressCard);
            this.progressCards.delete(data.url);
          }, 1500);
          return;
        }

        if (data.type === "error" && progressCard) {
          const statusMessage = progressCard.querySelector(".status-message");
          statusMessage.textContent = `Error: ${data.message}`;
          statusMessage.style.color = "red";
          console.log(data.message);
          setTimeout(() => {
            progressCard.parentNode.removeChild(progressCard);
            this.progressCards.delete(data.url);
          }, 1500);
          return;
        }
    }
  }

  createProgressCard(url) {
    const card = document.createElement("div");
    card.id = `progressCard-/${url}/`;
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
    this.progressCards.set(url, card);

    // Setup cancel button click handler
    card.querySelector(".cancel-download-btn").addEventListener("click", () => {
      this.cancelDownload(url);
    });
  }

  cancelDownload(url) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "cancelDownload",
          url,
        })
      );
      console.log(`Sent cancelDownload for ${url}`);
    } else {
      console.warn("WebSocket not connected. Cannot cancel download.");
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
