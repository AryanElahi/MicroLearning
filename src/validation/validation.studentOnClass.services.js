const joi = require("joi");
const c = require("./common");

const enrollmentParams = joi.object().keys({
  userId: c.id.required(),
  courseId: c.id.required(),
});

const fields = {
  mark: joi.number().integer().min(0),
  progress: joi.number().min(0).max(100),
  startTime: joi.date().iso(),
  endTime: joi.date().iso(),
};

module.exports = {
  read: { params: c.idParams },
  readStudentOnCourse: { params: enrollmentParams },
  create: {
    body: joi.object().keys({
      userId: c.id.required(),
      courseId: c.id.required(),
      ...fields,
      startTime: fields.startTime.default(() => new Date()),
      endTime: fields.endTime.default(() => new Date(Date.now() + 365 * 24 * 3600 * 1000)),
    }),
  },
  update: { params: enrollmentParams, body: joi.object().keys(fields).min(1) },
  updateDone: {
    params: enrollmentParams.keys({ taskId: c.id.required() }),
  },
  remove: { params: enrollmentParams },
};
