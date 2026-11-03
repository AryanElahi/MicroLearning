const { createMongoAbility } = require("@casl/ability");
const ApiError = require("../../utils/ApiError");

const parsePermissions = (permissions) => {
  if (Array.isArray(permissions)) return permissions;
  if (typeof permissions === "string") {
    try {
      const parsed = JSON.parse(permissions);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

/**
 * Must run after `requireAdmin`. Checks the admin's CASL rules.
 * @param {string} action create | read | update | delete
 * @param {string} subject e.g. "Course"
 */
const isCan = (action, subject) => (req, res, next) => {
  const ability = createMongoAbility(parsePermissions(req.admin && req.admin.permissions));
  if (ability.can(action, subject)) return next();
  return next(ApiError.forbidden(`You are not allowed to ${action} ${subject}`));
};

module.exports = { isCan, parsePermissions };
