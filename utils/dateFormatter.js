// utils/dateFormatter.js
const moment = require("moment-timezone");

exports.formatDate = (date) => {
  return moment(date).format("YYYY-MM-DD");
};
