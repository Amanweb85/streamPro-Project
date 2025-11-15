// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const passport = require("passport");

const {
  signup,
  verifyOtp,
  login,
  logoutUser,
  googleCallback,
} = require("../controllers/authController");

// ------ OTP - login Routes (Unchanged) ------

router.post("/signup", signup);
router.post("/verify", verifyOtp);
router.post("/login", login);
router.get("/logout", logoutUser);

// --- Google OAuth Routes (Now Stateless) ---

// Route to start the Google login process
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

//  The callback route (Google redirects to after successful authentication)
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallback // 2. Use the imported controller function here
);

module.exports = router;
