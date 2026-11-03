const joi = require("joi");
const c = require("./common");

const TASK_TYPES = ["task", "quiz"];

const fields = {
  title: c.title,
  chapterId: c.id,
  priority: c.priority,
  timeToRead: joi.number().integer().min(1),
  content: joi.alternatives().try(joi.object(), joi.array()),
  type: joi.string().valid(...TASK_TYPES),
};

module.exports = {
  read: { params: c.idParams },
  create: {
    body: joi.object().keys({
      ...fields,
      title: fields.title.required(),
      chapterId: fields.chapterId.required(),
      type: fields.type.required(),
    }),
  },
  update: { params: c.idParams, body: joi.object().keys(fields).min(1) },
  remove: { params: c.idParams },
};
