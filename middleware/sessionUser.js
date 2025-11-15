// middleware/setUser.js
const passport = require("passport");

module.exports = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) return next(err);

    req.user = user || null;
    res.locals.user = req.user;
    next();
  })(req, res, next); // <- don't forget this
};
