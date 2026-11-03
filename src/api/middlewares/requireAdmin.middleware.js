const adminService = require("../../services/admin.services");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");

/**
 * Must run after `isAuth`. Rejects tokens that were not issued to an admin
 * and loads the admin record into `req.admin`.
 */
const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.auth || req.auth.type !== "admin") {
    throw ApiError.forbidden("Access denied: admin privileges required");
  }
  const admin = await adminService.getAdminById(req.auth.id);
  if (!admin || admin.softDelete) {
    throw ApiError.unauthorized("Access denied: admin not found");
  }
  req.admin = admin;
  next();
});

module.exports = { requireAdmin };
