require("dotenv").config();
const app = require("./app");
const http = require("http");
const { WebSocketServer } = require("ws");

const connectDB = require("./config/db");
const { setupWebSocketHandlers } = require("./websocket/wsManager");

const PORT = process.env.PORT || 3000;
// --- Connect to Database ---
connectDB();


// Create HTTP server with express app
const server = http.createServer(app);

// Create WS server and bind handlers
const wss = new WebSocketServer({ server });
setupWebSocketHandlers(wss);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
