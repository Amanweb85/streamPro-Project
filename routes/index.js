const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");

const watchRoutes = require("./watchRoutes");
const videoRoutes = require("./videoRoutes");
const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const downloadRoutes = require("./downloadRoutes");
const createChatRoutes = require("./chatRoutes");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// SSR + page routes
router.use("/", watchRoutes);

// API routes
router.use("/api", videoRoutes);
router.use("/api", downloadRoutes);
router.use("/api/user", protect, userRoutes);
router.use("/api/auth", authRoutes);

// Chat routes with AI instance
router.use("/api/chat", createChatRoutes(genAI));

module.exports = router;
