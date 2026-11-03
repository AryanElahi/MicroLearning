const express = require("express");
const config = require("../../../../config");
const { isAuth, validate } = require("../../../middlewares");
const { authLimiter } = require("../../../middlewares/rateLimit.middleware");
const schema = require("../../../../validation/validation.admin.auth.services");
const adminService = require("../../../../services/admin.services");
const { toResponse } = require("../../../../services/token.services");
const asyncHandler = require("../../../../utils/asyncHandler");
const ApiError = require("../../../../utils/ApiError");

const router = express.Router();

// Open sign-up is a development convenience only. In production create the
// first admin with `npm run seed:admin` and the rest through /manageAdmin.
router.post(
  "/signup",
  (req, res, next) => (config.isProduction ? next(ApiError.notFound("Route not found")) : next()),
  validate(schema.signup),
  asyncHandler(async (req, res) => {
    res.status(201).json(toResponse(await adminService.signup(req.body)));
  })
);

router.post(
  "/login",
  authLimiter,
  validate(schema.login),
  asyncHandler(async (req, res) => {
    const { userName, password } = req.body;
    res.json(toResponse(await adminService.login(userName, password)));
  })
);

router.post(
  "/refreshToken",
  validate(schema.refreshToken),
  asyncHandler(async (req, res) => {
    res.json(toResponse(await adminService.refresh(req.body.RefreshToken)));
  })
);

router.post(
  "/logout",
  isAuth,
  asyncHandler(async (req, res) => {
    if (req.auth.type === "admin") await adminService.logout(req.auth.id);
    res.status(204).end();
  })
);

module.exports = router;
