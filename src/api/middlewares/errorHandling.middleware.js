const { Prisma } = require("@prisma/client");
const config = require("../../config");
const logger = require("../../utils/logger");
const ApiError = require("../../utils/ApiError");

/** Translate well-known Prisma errors into meaningful HTTP errors. */
const fromPrismaError = (err) => {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError)) return null;
  switch (err.code) {
    case "P2002":
      return ApiError.conflict("A record with the same unique value already exists");
    case "P2003":
      return ApiError.conflict(
        "Operation violates a relation: a related record is missing or still in use"
      );
    case "P2025":
      return ApiError.notFound("Record not found");
    default:
      return null;
  }
};

const normalizeError = (err) => {
  if (err instanceof ApiError) return err;
  const prismaError = fromPrismaError(err);
  if (prismaError) return prismaError;
  if (err && err.type === "entity.parse.failed") {
    return ApiError.badRequest("Malformed JSON body");
  }
  if (err && err.type === "entity.too.large") {
    return new ApiError(413, "Request body is too large");
  }
  return new ApiError(500, "Internal server error", { isOperational: false });
};

const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

// Express recognises error middleware by its four arguments.

const errorHandler = (err, req, res, next) => {
  const apiError = normalizeError(err);

  if (!apiError.isOperational || apiError.statusCode >= 500) {
    logger.error(err);
  }

  res.status(apiError.statusCode).json({
    code: apiError.statusCode,
    message: apiError.message,
    ...(config.isDevelopment && { stack: err && err.stack }),
  });
};

module.exports = {
  ApiError,
  errorHandler,
  notFoundHandler,
};
