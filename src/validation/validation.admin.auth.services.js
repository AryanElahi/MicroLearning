const joi = require("joi");
const c = require("./common");

const signup = {
  body: joi.object().keys({
    userName: c.userName.required(),
    password: c.newPassword.required(),
    role: c.role.required(),
    firstName: c.personName,
    lastName: c.personName,
    profilePhoto: joi.string().max(500),
  }),
};

const login = {
  body: joi.object().keys({
    userName: joi.string().trim().required(),
    password: c.loginPassword.required(),
  }),
};

const refreshToken = { body: c.refreshTokenBody };

module.exports = { signup, login, refreshToken };
