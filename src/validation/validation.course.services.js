const joi = require("joi");
const c = require("./common");

const fields = {
  title: c.title,
  teacherId: c.id,
  description: joi.string().trim().max(2000).allow(""),
  rate: joi.number().integer().min(0).max(5).allow(null),
  taskcount: joi.number().integer().min(0).allow(null),
  isLocked: joi.bool(),
};

module.exports = {
  read: { params: c.idParams },
  create: {
    body: joi.object().keys({
      ...fields,
      title: fields.title.required(),
      teacherId: fields.teacherId.required(),
      description: fields.description.default(""),
    }),
  },
  update: { params: c.idParams, body: joi.object().keys(fields).min(1) },
  lock: { params: c.idParams, body: joi.object().keys({ lockStatus: joi.bool().required() }) },
  remove: { params: c.idParams },
};
