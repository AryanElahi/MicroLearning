const { sanitize, pickDefined } = require("../../src/utils/sanitize");

describe("sanitize", () => {
  it("removes password and refresh token from records and lists", () => {
    const record = { id: 1, userName: "admin", password: "hash", refreshToken: "t" };
    expect(sanitize(record)).toEqual({ id: 1, userName: "admin" });
    expect(sanitize([record])).toEqual([{ id: 1, userName: "admin" }]);
    expect(record.password).toBe("hash"); // does not mutate
  });

  it("passes through null", () => {
    expect(sanitize(null)).toBeNull();
  });
});

describe("pickDefined", () => {
  it("keeps only listed, defined keys", () => {
    expect(pickDefined({ a: 1, b: undefined, c: 3, id: 9 }, ["a", "b", "c"])).toEqual({
      a: 1,
      c: 3,
    });
  });
});
