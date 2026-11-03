const rateLimit = require("express-rate-limit");
const config = require("../../config");

/** Limits brute force on login/OTP endpoints. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => config.isTest,
  message: { code: 429, message: "Too many requests, please try again later" },
});

module.exports = { authLimiter };
