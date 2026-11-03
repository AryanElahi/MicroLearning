const joi = require("joi");
const c = require("./common");

const userNameParams = joi.object().keys({ userName: joi.string().trim().required() });

const getAll = { query: c.pagination };

const read = { params: userNameParams };

const create = {
  body: joi.object().keys({
    userName: c.userName.required(),
    password: c.newPassword.required(),
    role: c.role.required(),
    firstName: c.personName,
    lastName: c.personName,
    profilePhoto: joi.string().max(500),
  }),
};

const update = {
  params: userNameParams,
  body: joi
    .object()
    .keys({
      password: c.newPassword,
      role: c.role,
      firstName: c.personName,
      lastName: c.personName,
      profilePhoto: joi.string().max(500),
    })
    .min(1),
};

const remove = { params: userNameParams };

module.exports = { getAll, read, create, update, remove };
