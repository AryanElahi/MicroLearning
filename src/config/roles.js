const ACTIONS = ["create", "read", "update", "delete"];

const SUBJECTS = [
  "Admin",
  "User",
  "Course",
  "Season",
  "Chapter",
  "Task",
  "Class",
  "StudentOnClass",
];

const ROLES = ["Admin", "Teacher", "Supervisor"];

const allActionsOn = (subjects) =>
  subjects.flatMap((subject) => ACTIONS.map((action) => ({ action, subject })));

const readOnly = (subjects) => subjects.map((subject) => ({ action: "read", subject }));

const ROLE_PERMISSIONS = Object.freeze({
  Admin: allActionsOn(SUBJECTS),
  Teacher: [
    ...readOnly(["Admin"]),
    ...allActionsOn(SUBJECTS.filter((subject) => subject !== "Admin")),
  ],
  Supervisor: readOnly(SUBJECTS),
});

/**
 * Returns the CASL rules for a role. Unknown roles get no permissions.
 * @param {string} role
 */
const permissionsForRole = (role) => ROLE_PERMISSIONS[role] || [];

module.exports = {
  ACTIONS,
  SUBJECTS,
  ROLES,
  permissionsForRole,
};
