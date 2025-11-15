// config/passport-setup.js

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const User = require("../models/userModel");

// This function helps extract the JWT from the cookie
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["jwt"];
  }
  return token;
};

// --- Google OAuth Strategy ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    // This function is called when a user successfully authenticates with Google.
    async (accessToken, refreshToken, profile, done) => {
      try {
        let currentUser = await User.findOne({ googleId: profile.id });

        if (currentUser) {
          return done(null, currentUser);
        } else {
          const newUser = await new User({
            googleId: profile.id,
            fullname: profile.displayName,
            email: profile.emails[0].value,
            profilePhoto: profile.photos[0].value,
          }).save();
          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// --- JWT Strategy --- for protecting routes
// this middleware will be execute while authenticating user using passport.authenticate("jwt", { session: false }) and Check if the token's signature is valid using the secret key.
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET, // Your secret for signing tokens
    },
    async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.user.id);
        // console.log(user);
        if (user) {
          return done(null, user); // grant access, If the user exists in the database
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
//  authenticated user object is set by passport at req.user, by default
