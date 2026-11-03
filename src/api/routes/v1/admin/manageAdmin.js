const express = require("express");
const { adminOnly, validate } = require("../../../middlewares");
const schema = require("../../../../validation/validation.admin.manageAdmin.services");
const adminService = require("../../../../services/admin.services");
const asyncHandler = require("../../../../utils/asyncHandler");
const ApiError = require("../../../../utils/ApiError");
const { sanitize } = require("../../../../utils/sanitize");

const router = express.Router();

router.get(
  "/getAllAdmins",
  adminOnly("read", "Admin"),
  validate(schema.getAll),
  asyncHandler(async (req, res) => {
    const result = await adminService.getAllAdmins(req.query);
    res.json({ ...result, items: sanitize(result.items) });
  })
);

router.get(
  "/:userName",
  adminOnly("read", "Admin"),
  validate(schema.read),
  asyncHandler(async (req, res) => {
    const admin = await adminService.getAdminByUserName(req.params.userName);
    if (!admin) throw ApiError.notFound("Admin not found");
    res.json(sanitize(admin));
  })
);

router.post(
  "/",
  adminOnly("create", "Admin"),
  validate(schema.create),
  asyncHandler(async (req, res) => {
    res.status(201).json(sanitize(await adminService.createAdmin(req.body)));
  })
);

router.put(
  "/:userName",
  adminOnly("update", "Admin"),
  validate(schema.update),
  asyncHandler(async (req, res) => {
    if (req.admin.userName !== req.params.userName) {
      throw ApiError.forbidden("Each admin can only update their own profile");
    }
    res.json(sanitize(await adminService.updateAdmin(req.params.userName, req.body)));
  })
);

router.delete(
  "/:userName",
  adminOnly("delete", "Admin"),
  validate(schema.remove),
  asyncHandler(async (req, res) => {
    if (req.admin.userName === req.params.userName) {
      throw ApiError.badRequest("You cannot delete your own account");
    }
    await adminService.deleteAdmin(req.params.userName);
    res.status(204).end();
  })
);

module.exports = router;
