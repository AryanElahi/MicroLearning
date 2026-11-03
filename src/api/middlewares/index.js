const { isAuth } = require("./isAuth.middleware");
const { requireAdmin } = require("./requireAdmin.middleware");
const { isCan } = require("./isCan.middleware");
const validate = require("./validate.middleware");

/** Authenticated admin that is allowed to perform `action` on `subject`. */
const adminOnly = (action, subject) => [isAuth, requireAdmin, isCan(action, subject)];

module.exports = { isAuth, requireAdmin, isCan, validate, adminOnly };
