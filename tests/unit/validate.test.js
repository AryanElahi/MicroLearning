const joi = require("joi");
const validate = require("../../src/api/middlewares/validate.middleware");

const run = (schema, req) =>
  new Promise((resolve) => {
    validate(schema)(req, {}, (err) => resolve(err));
  });

describe("validate middleware", () => {
  const schema = {
    params: joi.object({ id: joi.number().required() }),
    query: joi.object({ page: joi.number().default(1) }),
  };

  it("coerces values in params and query", async () => {
    const req = { params: { id: "7" }, query: {} };
    expect(await run(schema, req)).toBeUndefined();
    expect(req.params.id).toBe(7);
    expect(req.query.page).toBe(1);
  });

  it("returns a 400 ApiError listing every problem", async () => {
    const err = await run(schema, { params: { id: "x" }, query: { page: "y" } });
    expect(err.statusCode).toBe(400);
    expect(err.message).toMatch(/id/);
    expect(err.message).toMatch(/page/);
  });
});
