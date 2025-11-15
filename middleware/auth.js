const passport = require("passport");
//  authentication middleware.
const protect = passport.authenticate("jwt", { session: false });

module.exports = protect;
