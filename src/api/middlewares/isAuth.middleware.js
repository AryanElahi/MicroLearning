const jwt = require("jsonwebtoken");
const config = require("../../config");
const ApiError = require("../../utils/ApiError");

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice(7).trim();
  // Kept for backwards compatibility with existing clients.
  return req.headers["access-token"];
};

/**
 * Verifies the access token and exposes its claims as `req.auth`
 * (`{ id, type }`, where `type` is "admin" or "user").
 */
const isAuth = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return next(ApiError.unauthorized("Access denied: token not provided"));
  }
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    if (!payload || !payload.id || !["admin", "user"].includes(payload.type)) {
      return next(ApiError.unauthorized("Access denied: invalid token"));
    }
    req.auth = { id: payload.id, type: payload.type };
    return next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Access denied: token expired"
        : "Access denied: invalid token";
    return next(ApiError.unauthorized(message));
  }
};

module.exports = { isAuth };
