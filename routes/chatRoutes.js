// routes/chatRoutes.js

const express = require("express");
const router = express.Router();
const createChatController = require("../controllers/chatController");

// This function takes the genAI instance and creates the routes
const createRoutes = (genAI) => {
  const chatController = createChatController(genAI);
  router.post("/", chatController.sendMessage);
  return router;
};

module.exports = createRoutes;
