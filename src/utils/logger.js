/* eslint-disable no-console */
const config = require("../config");

const silent = config.isTest;

const logger = {
  info: (...args) => !silent && console.log("[info]", ...args),
  warn: (...args) => !silent && console.warn("[warn]", ...args),
  error: (...args) => !silent && console.error("[error]", ...args),
  debug: (...args) => !silent && config.isDevelopment && console.debug("[debug]", ...args),
};

module.exports = logger;
