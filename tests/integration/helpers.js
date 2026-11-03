const jwt = require("jsonwebtoken");
const { permissionsForRole } = require("../../src/config/roles");

const tokenFor = (id, type) =>
  jwt.sign({ id, type }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });

const adminRecord = (overrides = {}) => ({
  id: 1,
  userName: "rootadmin",
  role: "Admin",
  password: "hash",
  refreshToken: "",
  softDelete: false,
  permissions: permissionsForRole(overrides.role || "Admin"),
  ...overrides,
});

module.exports = { tokenFor, adminRecord };
