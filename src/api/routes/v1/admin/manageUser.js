const express = require("express");
const { adminOnly, validate } = require("../../../middlewares");
const schema = require("../../../../validation/validation.admin.manageUser.services");
const userService = require("../../../../services/user.services");
const asyncHandler = require("../../../../utils/asyncHandler");
const ApiError = require("../../../../utils/ApiError");
const { sanitize } = require("../../../../utils/sanitize");

const router = express.Router();

router.get(
  "/getAllUsers",
  adminOnly("read", "User"),
  validate(schema.getAll),
  asyncHandler(async (req, res) => {
    const result = await userService.getAllUsers(req.query);
    res.json({ ...result, items: sanitize(result.items) });
  })
);

router.get(
  "/:phone",
  adminOnly("read", "User"),
  validate(schema.read),
  asyncHandler(async (req, res) => {
    const user = await userService.getUserByPhone(req.params.phone);
    if (!user) throw ApiError.notFound("User not found");
    res.json(sanitize(user));
  })
);

router.post(
  "/",
  adminOnly("create", "User"),
  validate(schema.create),
  asyncHandler(async (req, res) => {
    res.status(201).json(sanitize(await userService.createUser(req.body)));
  })
);

router.put(
  "/:phone",
  adminOnly("update", "User"),
  validate(schema.update),
  asyncHandler(async (req, res) => {
    res.json(sanitize(await userService.updateUser(req.params.phone, req.body)));
  })
);

router.delete(
  "/:phone",
  adminOnly("delete", "User"),
  validate(schema.remove),
  asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.phone);
    res.status(204).end();
  })
);

module.exports = router;
