// creating server

const express = require("express");
const app = express();

// Applying all middleware
require("./middleware")(app);

// View engine
app.set("view engine", "ejs");
app.set("views", require("path").join(__dirname, "views"));

// Mount routes (import centralized routes from /routes/index.js)
app.use("/", require("./routes"));

// -----------------------------
// 404 handler
app.use((req, res) => {
  console.log("page not found");
  res.send("Page not found! 404");
  // res.status(404).render('404', { title: 'Page Not Found' });
});

// -----------------------------

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    title: "Error",
    message: err.message || "Server error",
  });
});

module.exports = app;
