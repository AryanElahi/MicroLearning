const joi = require("joi");
const c = require("./common");

const phoneParams = joi.object().keys({ phone: c.phone.required() });

const profile = {
  firstName: c.personName,
  lastName: c.personName,
  countryCode: joi.string().trim().max(5),
  address: joi.string().trim().max(500),
  blocked: joi.bool(),
};

const getAll = { query: c.pagination };

const read = { params: phoneParams };

const create = {
  body: joi.object().keys({
    ...profile,
    phone: c.phone.required(),
    password: c.newPassword.required(),
  }),
};

const update = {
  params: phoneParams,
  body: joi
    .object()
    .keys({ ...profile, password: c.newPassword })
    .min(1),
};

const remove = { params: phoneParams };

module.exports = { getAll, read, create, update, remove };
