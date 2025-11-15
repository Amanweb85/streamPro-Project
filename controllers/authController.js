const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ************* SIGNUP USING OTP *************

const { sendOtpEmail } = require("../services/emailService");

// initial signup and SENDing the token in a cookie
const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      console.log("user Already exists", user);
      return res.status(400).json({ message: "user already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const payload = { fullname, email, password: hashedPassword, otp };

    const tempToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    await sendOtpEmail(email, otp);

    // ✅ SET the temporary token in a secure, HttpOnly cookie
    res.cookie("tempToken", tempToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 600000, // 10 minutes in milliseconds
    });

    // The response no longer needs to include the token
    res.status(200).json({
      message: "OTP sent to your email. Please verify.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify the OTP by READINGing the token from the cookie
const verifyOtp = async (req, res) => {
  try {
    const { tempToken } = req.cookies;
    const { otp } = req.body;
    console.log("varifying otp", otp);

    if (!tempToken || !otp) {
      //   return res.redirect("/signup?error=OTP is required");
      return res.status(400).json({ message: "OTP is required." });
    }
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.otp !== otp) {
      //   return res.redirect("/signup?error=Invalid OTP");
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Create the user
    const newUser = new User({
      fullname: decoded.fullname,
      email: decoded.email,
      password: decoded.password,
      isVerified: true,
    });

    console.log(await newUser.save());
    //  --- Auto-login logic ---

    // Create the main session token and set the cookie
    const payload = { user: { id: newUser.id, email: newUser.email } };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Set the main 'token' cookie for the session
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000,
    });

    // Clear the temporary token cookie
    res.clearCookie("tempToken");

    // ✅ Redirect the user to their dashboard or the homepage
    req.flash("successMsg", "Welcome to the streamPro.");
    res.redirect("/search");
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      //   return res.redirect("/signup?error=OTP has expired");
      return res
        .status(400)
        .json({ message: "OTP has expired. Please try signing up again." });
    }

    res.redirect("/error");
    // res.status(500).json({ message: "Server error during verification.", error: error.message });
  }
};

const login = async (req, res) => {
  console.log("\nlogging in ");
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(password, user.password, "   match found", isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Create the main session JWT payload
    const payload = {
      user: {
        id: user.id,
        email: user.email,
      },
    };

    // Sign the main token (e.g., expires in 1 day)
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // ✅ Set the main 'token' cookie for the session
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400000, // 24 hours in milliseconds
    });

    //
    res.redirect("/search");
    // res.status(200).json({ message: "Logged in successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error during login." });
  }
};

// //   Logs the user out by clearing their JWT cookie.

const logoutUser = (req, res) => {
  try {
    console.log("logouting");
    //  removing the specified cookie.
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    // res.cookie("jwt", "", {
    //   httpOnly: true,
    //   expires: new Date(0), // Set the expiration date to the past
    // });
    req.flash("successMsg", "Logged out successfully.");
    res.redirect("/search"); // Logged out successfully.
  } catch (error) {
    console.dir(error);
    res
      .status(500)
      .json({ message: "Server error during logout.", error: error.message });
  }
};

// This function handles the logic after Google authentication is successful
const googleCallback = (req, res) => {
  // The passport.authenticate middleware has already run and attached the user.
  // `req.user` contains the authenticated user from your database.
  // 1. Create the JWT Payload
  const payload = {
    user: { id: req.user.id, fullname: req.user.fullname },
  };

  // 2. Sign the token
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d", // Token expires in 1 day
  });

  // 3. Send the token in a secure, httpOnly cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  // 4. Redirect to your frontend dashboard
  req.flash("successMsg", "Logged in successfully.");
  res.redirect("/search"); // Or your frontend URL
};

module.exports = {
  signup,
  verifyOtp,
  login,
  logoutUser,
  googleCallback,
};
// const newUser = new User({
//   fullname: "aman",
//   email: "emaill",
//   password: "98904234",
//   isVerified: true,
// });

// newUser.save().then((res) => {
//   console.log(res);
// });
