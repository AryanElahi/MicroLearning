const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");
const ApiError = require("../utils/ApiError");

/** Refresh tokens are stored hashed so a database leak doesn't leak sessions. */
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/**
 * Issues an access/refresh token pair.
 * @param {number} id subject id
 * @param {"admin"|"user"} type subject type
 */
const generateTokens = (id, type) => {
  const accessToken = jwt.sign({ id, type }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
  const refreshToken = jwt.sign({ id, type, jti: crypto.randomUUID() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
};

/**
 * Verifies a refresh token's signature and type. Returns its payload.
 * Callers must still compare it to the stored hash.
 */
const verifyRefreshToken = (token, expectedType) => {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret);
    if (payload.type !== expectedType) throw new Error("wrong token type");
    return payload;
  } catch {
    throw ApiError.unauthorized("Access denied: refresh token is not valid");
  }
};

/** Response shape kept for backwards compatibility with existing clients. */
const toResponse = ({ accessToken, refreshToken }) => ({
  Refresh_Token: refreshToken,
  Access_Token: accessToken,
});

module.exports = {
  generateTokens,
  verifyRefreshToken,
  hashToken,
  toResponse,
};
