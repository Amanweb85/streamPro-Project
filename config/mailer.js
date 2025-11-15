const nodemailer = require("nodemailer");
require("dotenv").config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // e.g., 'smtp.mailtrap.io' or 'smtp.gmail.com'
  port: parseInt(process.env.EMAIL_PORT, 10), // e.g., 2525 or 587
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Your SMTP username
    pass: process.env.EMAIL_PASS, // Your SMTP password
  },
});

// Verify the connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("Error with email transporter config:", error);
  } else {
    console.log("Email transporter is ready to send messages");
  }
});

module.exports = transporter;
