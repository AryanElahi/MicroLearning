const express = require("express");
const {
  signup,
  verify,
  login,
  refreshToken,
} = require("../../../../services/user.services.js");
const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const resault = await signup(req);
    return res.send(resault);
  } catch (error) {
    return next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const resault = await verify(req);
    return res.send(resault);
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const resault = await login(req);
    return res.send(resault);
  } catch (error) {
    return next(error);
  }
});

router.post("/refreshToken", async (req, res, next) => {
  try {
    const resault = await refreshToken(req);
    return res.send(resault);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
