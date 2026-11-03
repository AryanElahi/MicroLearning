const joi = require("joi");
const c = require("./common");

const phoneOnly = { body: joi.object().keys({ phone: c.phone.required() }) };

const phoneCodePassword = {
  body: joi.object().keys({
    phone: c.phone.required(),
    code: c.otpCode.required(),
    password: c.newPassword.required(),
  }),
};

const login = {
  body: joi.object().keys({
    phone: c.phone.required(),
    password: c.loginPassword.required(),
  }),
};

module.exports = {
  signup: phoneOnly,
  verify: phoneCodePassword,
  login,
  refreshToken: { body: c.refreshTokenBody },
  forgetPassword: phoneOnly,
  verifyForgetPassword: phoneCodePassword,
};
