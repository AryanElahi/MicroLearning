const express = require("express");
const v1Loader = require("./v1");

const controlVersion = () => {
  const router = express.Router();
  router.use("/v1", v1Loader());
  return router;
};

module.exports = controlVersion;
