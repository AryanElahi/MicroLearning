const schema = require("../../../../validation/validation.course.services");
const service = require("../../../../services/course/course.services");
const { crudRouter, lockRoute } = require("./crudRouter");

module.exports = crudRouter({
  subject: "Course",
  schema,
  listPath: "/getAllCourses",
  publicRead: true, // students can browse courses
  service: {
    getAll: service.getAllCourses,
    getById: service.getCourseById,
    create: service.createCourse,
    update: service.updateCourse,
    remove: service.deleteCourse,
  },
  extend: (router) =>
    lockRoute(router, { subject: "Course", schema, setLockStatus: service.setLockStatus }),
});
