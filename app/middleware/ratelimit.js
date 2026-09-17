const rateLimit = require("express-rate-limit");

module.exports = (options = {}) => rateLimit({
  windowMs: options.windowMs || 15 * 60 * 1000,
  limit: options.limit || 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again later." }
});
