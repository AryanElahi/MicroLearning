const joi = require("joi");
const c = require("./common");

const fields = { title: c.title, seasonId: c.id, priority: c.priority };

module.exports = {
  read: { params: c.idParams },
  create: {
    body: joi.object().keys({
      title: fields.title.required(),
      seasonId: fields.seasonId.required(),
      priority: fields.priority.required(),
    }),
  },
  update: { params: c.idParams, body: joi.object().keys(fields).min(1) },
  remove: { params: c.idParams },
};
