const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const sessionManager = require("../services/sessionManager");

// const ytDlpPath = path.resolve(process.cwd(), "yt-dlp");
// const ytdlp = new YTDlpWrap(ytDlpPath);

//creating a downloads folder if it doesn't exist
const DOWNLOAD_FOLDER = path.join(
  __dirname.split("Downloads")[0],
  "..",
  "Downloads"
);
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
  fs.mkdirSync(DOWNLOAD_FOLDER);
}

exports.downloadPlaylist = async (req, res) => {
  const listUrl = req.query.listUrl;
  console.log("requesting playlist download :", listUrl);
  let videos = await downloadPlaylist(listUrl); // getting all videos of playlist in an array
  res.send({ videos });
};

//---------------------- DOWNLOADING VIDEO -------------------------

// Make sure to import your sessionManager as well
// import sessionManager from './sessionManager';

// --- Setup ---
// 1. Define the path to your yt-dlp binary. This is crucial for deployment.

// 2. Instantiate YTDlpWrap once.

// exports.downloadVideo = async (req, res) => {
//   console.log("downloading video");
//   const { videoUrl, quality, extension, sessionId } = req.body;

//   if (!videoUrl || !sessionId) {
//     return res.status(400).send("Video URL and Session ID are required.");
//   }

//   let ws = sessionManager.getSession(sessionId)?.ws;
//   if (!ws || ws.readyState !== ws.OPEN) {
//     return res.status(400).send("WebSocket connection is not active.");
//   }

//   const tempDir = path.join(__dirname, "..", "downloads", sessionId);
//   if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir);
//   }

//   const filePath = path.join(tempDir, "%(title)s.%(ext)s");

//   const args = [
//     videoUrl,
//     "-f",
//     `bestvideo[height<=${quality}][ext=${extension}]+bestaudio[ext=${
//       extension === "mp4" ? "m4a" : "webm"
//     }]/best/best`,
//     "-o",
//     filePath,
//     "--progress",
//     "--no-playlist",
//   ];

//   // Use yt-dl-wrap's exec method
//   const ytDlpProcess = ytdlp.exec(args);

//   // Store the process if needed (e.g., to allow cancellation)
//   // .childProcess gives you access to the raw spawn object
//   sessionManager.addDownload(sessionId, videoUrl, ytDlpProcess.childProcess);

//   // --- Event Handling with yt-dl-wrap ---

//   // Handle 'start' by listening for the destination event
//   ytDlpProcess.on("ytDlpEvent", (eventType, eventData) => {
//     // console.log("          ", eventData);
//     // The 'ytDlpEvent' gives you raw output lines. We look for the destination.
//     if (eventType === "download" && eventData.includes("Destination:")) {
//       const titleMatch = eventData.match(/Destination: .*?[\\\/](.+?)\.f\d+\./);
//       console.log("title is ", titleMatch[1]);
//       ws = sessionManager.getSession(sessionId)?.ws; // Re-check ws connection
//       if (ws && ws.readyState === ws.OPEN) {
//         ws.send(
//           JSON.stringify({
//             type: "start",
//             url: videoUrl,
//             videoName: titleMatch ? titleMatch[1] : "Starting...",
//           })
//         );
//       }
//     }
//   });

//   // Handle progress updates
//   ytDlpProcess.on("progress", (progress) => {
//     console.log(progress);
//     ws = sessionManager.getSession(sessionId)?.ws; // Re-check ws connection
//     if (ws && ws.readyState === ws.OPEN) {
//       ws.send(
//         JSON.stringify({
//           type: "progress",
//           url: videoUrl,
//           progress: parseFloat(progress.percent),
//           speed: progress.currentSpeed || "",
//           size: progress.totalSize || "",
//         })
//       );
//     }
//   });

//   // Handle errors
//   ytDlpProcess.on("error", (error) => {
//     console.error(`yt-dlp error for ${videoUrl}:`, error);
//     ws = sessionManager.getSession(sessionId)?.ws;
//     if (ws && ws.readyState === ws.OPEN) {
//       ws.send(
//         JSON.stringify({
//           type: "error",
//           url: videoUrl,
//           message: `Download error: ${error.message}`,
//         })
//       );
//     }
//   });

//   // Handle process completion
//   ytDlpProcess.on("close", () => {
//     // The 'code' argument is optional if you don't use it
//     console.log("ydlp-process closed");
//     const downloads = sessionManager.getSession(sessionId)?.downloads;
//     if (downloads) {
//       downloads.delete(videoUrl);
//     }

//     // The 'close' event for yt-dl-wrap indicates success.
//     // The library's 'error' event handles non-zero exit codes.
//     setTimeout(() => {
//       fs.readdir(tempDir, (err, files) => {
//         if (err || !files) {
//           console.error("Error reading directory:", err);
//           ws = sessionManager.getSession(sessionId)?.ws;
//           if (ws && ws.readyState === ws.OPEN) {
//             ws.send(
//               JSON.stringify({
//                 type: "error",
//                 url: videoUrl,
//                 message: "Download succeeded but file could not be found.",
//               })
//             );
//           }
//           return;
//         }

//         const videoFile = files.find((file) =>
//           [".mp4", ".mkv", ".webm"].includes(path.extname(file).toLowerCase())
//         );

//         if (!videoFile) {
//           console.error(`File not found for ${videoUrl} in ${tempDir}`);
//           ws = sessionManager.getSession(sessionId)?.ws;
//           if (ws && ws.readyState === ws.OPEN) {
//             ws.send(
//               JSON.stringify({
//                 type: "error",
//                 url: videoUrl,
//                 message: "Download succeeded but video file is missing.",
//               })
//             );
//           }
//           return;
//         }

//         const downloadUrl = `/api/serveDownload/${sessionId}/${encodeURIComponent(
//           videoFile
//         )}`;
//         ws = sessionManager.getSession(sessionId)?.ws;
//         if (ws && ws.readyState === ws.OPEN) {
//           ws.send(
//             JSON.stringify({
//               type: "complete",
//               url: videoUrl,
//               downloadUrl,
//               title: path.parse(videoFile).name,
//             })
//           );
//         }
//       });
//     }, 2000); // Your 2-second delay
//   });

//   // You might want to send an initial confirmation response here,
//   // since the download process is now handled via WebSocket.
//   // res.status(200).send({ message: "Download initiated." });
// };

exports.downloadVideo = async (req, res) => {
  console.log("downloading video");
  const { videoUrl, quality, extension, sessionId } = req.body;

  if (!videoUrl || !sessionId) {
    return res.status(400).send("Video URL and Session ID are required.");
  }
  // console.log(videoUrl, quality, extension, sessionId)

  let ws = sessionManager.getSession(sessionId)?.ws;
  if (!ws || ws.readyState !== ws.OPEN) {
    return res.status(400).send("WebSocket connection is not active.");
  }

  const tempDir = path.join(__dirname, "..", "downloads", sessionId);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const filePath = path.join(tempDir, "%(title)s.%(ext)s");

  const args = [
    videoUrl,
    // '-f', 'bestvideo+bestaudio/best',
    "-f",
    `bestvideo[height<=${quality}][ext=${extension}]+bestaudio[ext=${
      extension == "mp4" ? "m4a" : "webm"
    }]/best/best`,
    // '-f', `bestvideo[height<=${quality}]+bestaudio/best/best`,
    "-o",
    filePath,
    "--progress",
    "--no-playlist",
    // '--embed-thumbnail',
    // '--recode-video', 'mp4'
  ];

  // Spawn yt-dlp process
  const ytDlp = spawn("yt-dlp", args);
  sessionManager.addDownload(sessionId, videoUrl, ytDlp);

  ytDlp.stdout.on("data", (data) => {
    const output = data.toString();
    const progressMatch = output.match(/\[download\]\s+(\d+\.\d+)%/);
    const speedMatch = output.match(/at\s+([0-9\.]+[KMG]i?B\/s)/);
    const sizeMatch = output.match(/of\s+([0-9\.]+[KMG]i?B)/);
    console.log(output);
    const titleMatch = output.match(
      /Destination: .*\\(.+?)\.f\d+\.(mp4|webm|mkv)/
    );

    ws = sessionManager.getSession(sessionId).ws;
    if (ws && ws.readyState === ws.OPEN) {
      if (progressMatch) {
        ws.send(
          JSON.stringify({
            type: "progress",
            url: videoUrl,
            progress: parseFloat(progressMatch[1]),
            speed: speedMatch ? speedMatch[1] : "N/A",
            size: sizeMatch ? sizeMatch[1] : "N/A",
          })
        );
      } else {
        ws.send(
          JSON.stringify({
            type: "start",
            url: videoUrl,
            videoName: titleMatch ? titleMatch[1] : "",
          })
        );
      }
    }
  });

  ytDlp.stderr.on("data", (data) => {
    // console.error(`yt-dlp stderr for ${videoUrl}: ${data}`);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(
        JSON.stringify({
          type: "",
          url: videoUrl,
          message: `Download error: ${data.toString()}`,
        })
      );
    }
  });

  ytDlp.on("close", (code) => {
    console.log("ydlp-process closed");
    const downloads = sessionManager.getSession(sessionId)?.downloads;
    if (downloads) {
      downloads.delete(videoUrl);
    }

    if (code === 0) {
      // Use a slight delay to ensure the file is not locked
      setTimeout(() => {
        fs.readdir(tempDir, (err, files) => {
          if (err || !files) {
            console.error("Error reading directory:", err);
            if (ws && ws.readyState === ws.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  url: videoUrl,
                  message: "Download succeeded but file could not be found.",
                })
              );
            }
            return;
          }

          // Find the downloaded file based on common video extensions
          const videoFile = files.find((file) => {
            return [".mp4", ".mkv", ".webm"].includes(
              path.extname(file).toLowerCase()
            );
          });

          if (!videoFile) {
            console.error(`File not found for ${videoUrl} in ${tempDir}`);
            if (ws && ws.readyState === ws.OPEN) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  url: videoUrl,
                  message: "Download succeeded but video file is missing.",
                })
              );
            }
            return;
          }

          const downloadUrl = `/api/serveDownload/${sessionId}/${encodeURIComponent(
            videoFile
          )}`;
          if (ws && ws.readyState === ws.OPEN) {
            ws.send(
              JSON.stringify({
                type: "complete",
                url: videoUrl,
                downloadUrl,
                title: path.parse(videoFile).name,
              })
            );
          }
        });
      }, 2000); // 1-second delay
    } else {
      if (ws && ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            type: "error",
            url: videoUrl,
            message: "Download failed.",
          })
        );
      }
    }
  });

  //   res.status(200).send({ message: "Download started." });
};

// New route to serve the downloaded video and clean up the directory after.

exports.serverDownload = async (req, res) => {
  const { sessionId, fileName } = req.params;
  const filePath = path.join(DOWNLOAD_FOLDER, sessionId, fileName);
  console.log("\n serveing video", fileName);
  if (!sessionId || !fileName) {
    res.json({ message: "filename is required" });
  }

  res.download(filePath, async (err) => {
    if (err && !res.headersSent) {
      console.error("File download error:", err);
      res.status(404).send("File not found ");
    }
  });

  // Listen for the response to finish and then clean up the directory
  res.on("finish", async () => {
    fs.rm(filePath.trim(), (err) => {
      if (err) {
        console.error(`Failed to delete file ${filePath}:`, err);
      } else {
        console.log(`Successfully deleted file ${filePath}`);
      }
    });
  });

  // Fallback cleanup in case of all file of a directory send to client disconnect
  res.on("close", () => {
    const dirPath = path.join(DOWNLOAD_FOLDER, sessionId);
    fs.readdir(dirPath, (err, files) => {
      if (!err && files.length <= 1) {
        fs.rm(dirPath, { recursive: true, force: true }, (err) => {
          if (err) {
            console.error(`Failed to delete directory ${dirPath}:`, err);
          } else {
            console.log(`Successfully deleted directory ${dirPath}`);
          }
        });
      }
    });
  });
};

// NOTE: Assuming spawn and sessionManager are available in the scope.

exports.startDownloadStream = (req, res) => {
  const { videoUrl, quality, extension, sessionId } = req.query;
  // const [videoUrl, quality, extension,sessionId] = [
  //   "https://youtu.be/gLptmcuCx6Q",
  //   "360",
  //   "mp4",
  // ];

  let ws = sessionManager.getSession(sessionId)?.ws;
  if (!ws || ws.readyState !== ws.OPEN) {
    return res.status(400).send("WebSocket connection is not active.");
  }

  const outputMimeType = extension === "mp4" ? "video/mp4" : "video/webm";
  const finalFileName = `download.${extension}`;

  const args = [
    "-f",
    `bestvideo[height<=${quality}]/bestaudio`,
    "-o",
    "-", // output to stdout (so we can pipe it)
    videoUrl,
  ];

  // res.setHeader(
  //   "Content-Disposition"
  //   `attachment; filename="${finalFileName}"`
  // );

  res.setHeader("Content-Type", outputMimeType);
  // 3. SPAWN YT-DLP PROCESS AND PIPE STREAM
  const ytDlp = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });

  ytDlp.stdout.pipe(res);
  sessionManager.addDownload(sessionId, videoUrl, ytDlp);

  ytDlp.stderr.on("data", (data) => {
    // console.error(`yt-dlp stderr for ${videoUrl}: ${data}`);
    if (ws && ws.readyState === ws.OPEN) {
      {
        const output = data.toString();
        const progressMatch = output.match(/\[download\]\s+(\d+\.\d+)%/);
        const speedMatch = output.match(/at\s+([0-9\.]+[KMG]i?B\/s)/);
        const sizeMatch = output.match(/of\s+([0-9\.]+[KMG]i?B)/);
        console.log(output);
        const titleMatch = output.match(
          /Destination: .*\\(.+?)\.f\d+\.(mp4|webm|mkv)/
        );

        ws = sessionManager.getSession(sessionId).ws;
        if (ws && ws.readyState === ws.OPEN) {
          if (progressMatch) {
            ws.send(
              JSON.stringify({
                type: "progress",
                url: videoUrl,
                progress: parseFloat(progressMatch[1]),
                speed: speedMatch ? speedMatch[1] : "N/A",
                size: sizeMatch ? sizeMatch[1] : "N/A",
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                type: "start",
                url: videoUrl,
                videoName: titleMatch ? titleMatch[1] : "",
              })
            );
          }
        }
      }
    }
  });

  ytDlp.on("close", (code) => {
    console.log("ydlp-process closed");
    const downloads = sessionManager.getSession(sessionId)?.downloads;
    if (downloads) {
      downloads.delete(videoUrl);
    }

    if (code != 0) {
      if (ws && ws.readyState === ws.OPEN) {
        console.log("download failed ");
        ws.send(
          JSON.stringify({
            type: "error",
            url: videoUrl,
            message: "Download failed.",
          })
        );
      }
    } else {
      if (ws && ws.readyState === ws.OPEN) {
        console.log("completed");
        ws.send(
          JSON.stringify({
            type: "complete",
            url: videoUrl,
          })
        );
      }
    }
    if (!res.writableEnded) {
      res.end();
    }
  });
  ytDlp.on("error", (err) => {
    console.error(
      `[Stream] Failed to start yt-dlp process for ${videoUrl}:`,
      err
    );
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(
        JSON.stringify({
          type: "error",
          url: videoUrl,
          message: `Failed to start download process: ${err.message}`,
        })
      );
    }
    if (!res.writableEnded) {
      res.status(500).send(`Error starting download stream: ${err.message}`);
    }
  });
};
