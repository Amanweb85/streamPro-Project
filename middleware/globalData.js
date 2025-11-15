const { locations, languages } = require("../ApiData/locationsAndLanguages");
const { changeFormate, changeTimeFormate, changeVidDurationFormat } = require('../utils/serverHelpers');

module.exports = (req, res, next) => {
    res.locals.locations = locations;
    res.locals.languages = languages;
    res.locals.changeFormate = changeFormate;
    res.locals.changeTimeFormate = changeTimeFormate;
    res.locals.changeVidDurationFormat = changeVidDurationFormat;
    next();
};
