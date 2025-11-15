const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "..", "log.txt");

module.exports = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const log = `${timestamp} : ${req.method} ${req.url}\n`;
  if (log) {
    fs.appendFile(logFile, log, (err) => {
      if (err) {
        console.error("Failed to write log:", err);
      }
      // Don't log "log saved" on every request — too noisy
    });
  }

  next();
};
