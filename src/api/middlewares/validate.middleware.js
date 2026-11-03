const Joi = require("joi");
const ApiError = require("../../utils/ApiError");

const pick = (object, keys) =>
  keys.reduce((result, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key];
    }
    return result;
  }, {});

/**
 * Validates (and coerces) `req.params`, `req.query` and `req.body`
 * against the given Joi schema map.
 */
const validate = (schema) => {
  const validSchema = pick(schema, ["params", "query", "body"]);
  const compiled = Joi.compile(validSchema).prefs({
    errors: { label: "key" },
    abortEarly: false,
  });

  return (req, res, next) => {
    const object = pick(req, Object.keys(validSchema));
    const { value, error } = compiled.validate(object);

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      return next(ApiError.badRequest(message));
    }

    Object.keys(value).forEach((key) => {
      if (key === "query") {
        // req.query is a getter in newer Express versions; mutate in place.
        Object.keys(req.query).forEach((k) => delete req.query[k]);
        Object.assign(req.query, value.query);
      } else {
        req[key] = value[key];
      }
    });
    return next();
  };
};

module.exports = validate;
