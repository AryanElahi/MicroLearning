const { permissionsForRole, SUBJECTS } = require("../../src/config/roles");

describe("permissionsForRole", () => {
  it("gives Admin every action on every subject", () => {
    expect(permissionsForRole("Admin")).toHaveLength(SUBJECTS.length * 4);
  });

  it("lets Teacher only read admins", () => {
    const adminRules = permissionsForRole("Teacher").filter((r) => r.subject === "Admin");
    expect(adminRules).toEqual([{ action: "read", subject: "Admin" }]);
  });

  it("makes Supervisor read-only", () => {
    const rules = permissionsForRole("Supervisor");
    expect(rules.every((r) => r.action === "read")).toBe(true);
    expect(rules).toHaveLength(SUBJECTS.length);
  });

  it("returns no permissions for unknown roles", () => {
    expect(permissionsForRole("Hacker")).toEqual([]);
  });
});
