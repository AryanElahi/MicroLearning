const express = require("express");
const { isAuth, validate } = require("../../../middlewares");
const { authLimiter } = require("../../../middlewares/rateLimit.middleware");
const schema = require("../../../../validation/validation.user.auth.services");
const userService = require("../../../../services/user.services");
const { toResponse } = require("../../../../services/token.services");
const asyncHandler = require("../../../../utils/asyncHandler");

const router = express.Router();

router.post(
  "/signup",
  authLimiter,
  validate(schema.signup),
  asyncHandler(async (req, res) => {
    await userService.signup(req.body.phone);
    res.json({ message: "Verification code sent" });
  })
);

router.post(
  "/verify",
  authLimiter,
  validate(schema.verify),
  asyncHandler(async (req, res) => {
    const { phone, code, password } = req.body;
    res.status(201).json(toResponse(await userService.verify(phone, code, password)));
  })
);

router.post(
  "/login",
  authLimiter,
  validate(schema.login),
  asyncHandler(async (req, res) => {
    const { phone, password } = req.body;
    res.json(toResponse(await userService.login(phone, password)));
  })
);

// No access token required: refreshing is exactly what you do once it expired.
router.post(
  "/refreshToken",
  validate(schema.refreshToken),
  asyncHandler(async (req, res) => {
    res.json(toResponse(await userService.refresh(req.body.RefreshToken)));
  })
);

router.post(
  "/logout",
  isAuth,
  asyncHandler(async (req, res) => {
    if (req.auth.type === "user") await userService.logout(req.auth.id);
    res.status(204).end();
  })
);

router.post(
  "/forgetpassword",
  authLimiter,
  validate(schema.forgetPassword),
  asyncHandler(async (req, res) => {
    await userService.forgetPassword(req.body.phone);
    res.json({ message: "If this number is registered, a code has been sent" });
  })
);

router.post(
  "/verifyforgetpassword",
  authLimiter,
  validate(schema.verifyForgetPassword),
  asyncHandler(async (req, res) => {
    const { phone, code, password } = req.body;
    res.json(toResponse(await userService.verifyForgetPassword(phone, code, password)));
  })
);

module.exports = router;
