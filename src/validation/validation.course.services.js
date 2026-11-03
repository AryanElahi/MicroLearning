const joi = require("joi");
const c = require("./common");

const fields = {
  title: c.title,
  teacherId: c.id,
  // Defaults to the teacher when omitted on create.
  mentorId: c.id,
  description: joi.string().trim().max(2000).allow(""),
  rate: joi.number().integer().min(0).max(5).allow(null),
  taskcount: joi.number().integer().min(0).allow(null),
  startTime: joi.date().iso(),
  endTime: joi.date().iso(),
  isLocked: joi.bool(),
};

const endAfterStart = (value, helpers) =>
  value.startTime && value.endTime && value.endTime <= value.startTime
    ? helpers.message("endTime must be after startTime")
    : value;

module.exports = {
  read: { params: c.idParams },
  create: {
    body: joi
      .object()
      .keys({
        ...fields,
        title: fields.title.required(),
        teacherId: fields.teacherId.required(),
        description: fields.description.default(""),
      })
      .custom(endAfterStart),
  },
  update: { params: c.idParams, body: joi.object().keys(fields).min(1).custom(endAfterStart) },
  lock: { params: c.idParams, body: joi.object().keys({ lockStatus: joi.bool().required() }) },
  remove: { params: c.idParams },
};
