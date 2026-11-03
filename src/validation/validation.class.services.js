const joi = require("joi");
const c = require("./common");

const fields = {
  title: c.title,
  startTime: joi.date().iso(),
  endTime: joi.date().iso(),
  mentorId: c.id,
  courseId: c.id,
  capacity: joi.number().integer().min(0),
  isLocked: joi.bool(),
};

module.exports = {
  read: { params: c.idParams },
  create: {
    body: joi
      .object()
      .keys({
        ...fields,
        title: fields.title.required(),
        mentorId: fields.mentorId.required(),
        courseId: fields.courseId.required(),
        capacity: fields.capacity.required(),
      })
      .custom((value, helpers) =>
        value.startTime && value.endTime && value.endTime <= value.startTime
          ? helpers.message("endTime must be after startTime")
          : value
      ),
  },
  update: { params: c.idParams, body: joi.object().keys(fields).min(1) },
  lock: { params: c.idParams, body: joi.object().keys({ lockStatus: joi.bool().required() }) },
  remove: { params: c.idParams },
};
