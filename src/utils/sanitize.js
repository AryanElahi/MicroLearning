const SENSITIVE_FIELDS = ["password", "refreshToken"];

/**
 * Removes secrets (password hash, refresh token) from a record or a list.
 */
const sanitize = (record) => {
  if (Array.isArray(record)) return record.map(sanitize);
  if (!record || typeof record !== "object") return record;
  const copy = { ...record };
  SENSITIVE_FIELDS.forEach((field) => delete copy[field]);
  return copy;
};

/** Keeps only the defined keys of `source` listed in `keys`. */
const pickDefined = (source, keys) =>
  keys.reduce((result, key) => {
    if (source && source[key] !== undefined) {
      result[key] = source[key];
    }
    return result;
  }, {});

module.exports = { sanitize, pickDefined };
