const crypto = require("crypto");
const axios = require("axios");
const config = require("../config");
const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");

const OTP_MIN = 10000;
const OTP_MAX = 100000; // exclusive -> 5 digit codes

/**
 * In-memory OTP store: phone -> { code, expiresAt, attempts }.
 * NOTE: this works for a single instance. Use Redis (or the database) when
 * running more than one replica.
 */
const store = new Map();

const generateCode = () => crypto.randomInt(OTP_MIN, OTP_MAX).toString();

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

async function sendSMS(code, phone) {
  if (!config.sms.apiKey) {
    if (config.isProduction) {
      throw new ApiError(503, "SMS service is not configured");
    }
    logger.warn(`KAVENEGAR_API_KEY is not set. OTP for ${phone}: ${code}`);
    return;
  }
  const url = `https://api.kavenegar.com/v1/${encodeURIComponent(
    config.sms.apiKey
  )}/verify/lookup.json`;
  try {
    await axios.get(url, {
      params: { receptor: phone, token: code, template: config.sms.template },
      timeout: 10000,
    });
  } catch (error) {
    logger.error("Kavenegar request failed:", error.message);
    throw new ApiError(502, "Failed to send verification code");
  }
}

/** Generates a code, stores it and sends it to the phone number. */
async function sendCode(phone) {
  const code = generateCode();
  store.set(phone, {
    code,
    expiresAt: Date.now() + config.otp.ttlMs,
    attempts: 0,
  });
  await sendSMS(code, phone);
}

/**
 * Checks a code. Codes are single-use, expire after OTP_TTL_SECONDS and are
 * invalidated after OTP_MAX_ATTEMPTS wrong guesses.
 */
function verifyCode(phone, code) {
  const entry = store.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return false;
  }
  if (safeEqual(entry.code, code)) {
    store.delete(phone);
    return true;
  }
  entry.attempts += 1;
  if (entry.attempts >= config.otp.maxAttempts) store.delete(phone);
  return false;
}

/** Test helper. */
const clearStore = () => store.clear();

module.exports = { sendCode, verifyCode, clearStore };
