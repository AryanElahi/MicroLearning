const path = require("path");
const Joi = require("joi");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ["postgresql", "postgres"] })
    .required(),

  ACCESS_TOKEN_SECRET: Joi.string().min(32).required(),
  REFRESH_TOKEN_SECRET: Joi.string().min(32).required(),
  ACCESS_TOKEN_EXPIRES_IN: Joi.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default("30d"),

  CORS_ORIGIN: Joi.string().default("*"),
  PUBLIC_BASE_URL: Joi.string().uri().default("http://localhost:3000"),
  MEDIA_DIR: Joi.string().default(path.resolve(__dirname, "../media")),
  MAX_UPLOAD_SIZE_MB: Joi.number().positive().default(20),

  KAVENEGAR_API_KEY: Joi.string().allow("").default(""),
  KAVENEGAR_TEMPLATE: Joi.string().default("MicroLearning"),
  OTP_TTL_SECONDS: Joi.number().integer().positive().default(120),
  OTP_MAX_ATTEMPTS: Joi.number().integer().positive().default(5),

  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(4).max(15).default(10),
}).unknown(true);

const { value: env, error } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env, { abortEarly: false });

if (error) {
  // Fail fast: running with a broken configuration is never what we want.
  throw new Error(`Invalid environment configuration: ${error.message}`);
}

module.exports = Object.freeze({
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  isDevelopment: env.NODE_ENV === "development",
  isTest: env.NODE_ENV === "test",
  port: env.PORT,
  corsOrigin:
    env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  publicBaseUrl: env.PUBLIC_BASE_URL.replace(/\/+$/, ""),
  jwt: {
    accessSecret: env.ACCESS_TOKEN_SECRET,
    refreshSecret: env.REFRESH_TOKEN_SECRET,
    accessExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },
  upload: {
    dir: path.resolve(env.MEDIA_DIR),
    maxFileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  },
  sms: {
    apiKey: env.KAVENEGAR_API_KEY,
    template: env.KAVENEGAR_TEMPLATE,
  },
  otp: {
    ttlMs: env.OTP_TTL_SECONDS * 1000,
    maxAttempts: env.OTP_MAX_ATTEMPTS,
  },
  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS,
});
