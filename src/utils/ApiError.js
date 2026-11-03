class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} message message safe to show to API clients
   * @param {object} [options]
   * @param {boolean} [options.isOperational=true] expected error (vs. a bug)
   */
  constructor(statusCode, message, { isOperational = true } = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request") {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;
