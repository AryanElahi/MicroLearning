const joi = require("joi");
const { ROLES } = require("../config/roles");

const id = joi.number().integer().positive();
const phone = joi
  .string()
  .trim()
  .pattern(/^09\d{9}$/)
  .messages({
    "string.pattern.base": "{{#label}} must be an Iranian mobile number like 09123456789",
  });
// New passwords: 8-64 chars and at least one letter and one digit.
const newPassword = joi
  .string()
  .min(8)
  .max(64)
  .pattern(/[A-Za-z]/, "letter")
  .pattern(/\d/, "digit");
// Login only checks that something reasonable was sent, so existing
// passwords that predate the current policy keep working.
const loginPassword = joi.string().min(1).max(128);
const userName = joi
  .string()
  .trim()
  .pattern(/^[a-zA-Z0-9_.-]{5,32}$/)
  .messages({
    "string.pattern.base": "{{#label}} must be 5-32 characters: letters, digits, '.', '_' or '-'",
  });
const personName = joi.string().trim().min(2).max(50);
const role = joi.string().valid(...ROLES);
const otpCode = joi
  .string()
  .trim()
  .pattern(/^\d{4,8}$/);
const title = joi.string().trim().min(1).max(100);
const priority = joi.number().integer().min(0);
const refreshTokenBody = joi.object().keys({
  RefreshToken: joi.string().required(),
});
const pagination = joi.object().keys({
  page: joi.number().integer().min(1).default(1),
  size: joi.number().integer().min(1).max(100).default(20),
});
const idParams = joi.object().keys({ id: id.required() });

module.exports = {
  id,
  phone,
  newPassword,
  loginPassword,
  userName,
  personName,
  role,
  otpCode,
  title,
  priority,
  refreshTokenBody,
  pagination,
  idParams,
};
