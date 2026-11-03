process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/test?schema=public";
process.env.ACCESS_TOKEN_SECRET = "test-access-secret-that-is-long-enough-123";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-that-is-long-enough-456";
process.env.BCRYPT_SALT_ROUNDS = "4";
process.env.KAVENEGAR_API_KEY = "";
process.env.MEDIA_DIR = require("path").join(require("os").tmpdir(), "microlearning-test-media");
