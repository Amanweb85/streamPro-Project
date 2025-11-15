// middleware/index.js

const cors = require("cors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");

// Custom middleware
const sessionUser = require("./sessionUser");
const logApiRequests = require("./logApiRequests");

// Import the passport config to ensure it runs
require("../config/passport-setup");

module.exports = (app) => {
  app.use(
    cors({
      origin: "http://localhost:3000", // IMPORTANT: Use your frontend's actual URL
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(cookieParser()); // Already here, which is great for JWTs in cookies
  app.use(
    session({
      secret: process.env.SESSION_SECRET, // replace with env var in production
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(flash());

  // Make flash messages available in all templates (if using EJS/Pug)
  app.use((req, res, next) => {
    res.locals.success_msg = req.flash("successMsg");
    res.locals.error_msg = req.flash("error");
    // console.log("in use", res.locals.success_msg);
    // return res.send(res.locals);

    next();
  });
  app.use((req, res, next) => {
    console.log("in use", req.url, " ", res.locals.success_msg);

    next();
  });
  // Initialize Passport (without sessions)
  app.use(passport.initialize());
  app.use(sessionUser);

  // Custom middleware

  app.use("/", logApiRequests); // Logs all /api requests
};
