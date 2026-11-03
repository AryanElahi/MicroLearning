const schema = require("../../../../validation/validation.class.services");
const service = require("../../../../services/course/class.services");
const { crudRouter, lockRoute } = require("./crudRouter");

module.exports = crudRouter({
  subject: "Class",
  schema,
  listPath: "/getAllClasses",
  service: {
    getAll: service.getAllClasses,
    getById: service.getClassById,
    create: service.createClass,
    update: service.updateClass,
    remove: service.deleteClass,
  },
  extend: (router) =>
    lockRoute(router, { subject: "Class", schema, setLockStatus: service.setLockStatus }),
});
