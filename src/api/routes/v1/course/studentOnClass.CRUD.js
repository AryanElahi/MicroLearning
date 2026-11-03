const express = require("express");
const { adminOnly, validate } = require("../../../middlewares");
const schema = require("../../../../validation/validation.studentOnClass.services");
const service = require("../../../../services/course/studentOnClass.services");
const asyncHandler = require("../../../../utils/asyncHandler");
const ApiError = require("../../../../utils/ApiError");

const SUBJECT = "StudentOnClass";
const router = express.Router();

// Students of a course
router.get(
  "/getAllstudentsOnClass/:id",
  adminOnly("read", SUBJECT),
  validate(schema.read),
  asyncHandler(async (req, res) => res.json(await service.getStudentsOfCourse(req.params.id)))
);

router.get(
  "/getStudentById/:userId/:courseId",
  adminOnly("read", SUBJECT),
  validate(schema.readStudentOnCourse),
  asyncHandler(async (req, res) => {
    const record = await service.getEnrollment(req.params.userId, req.params.courseId);
    if (!record) throw ApiError.notFound(service.NOT_ENROLLED);
    res.json(record);
  })
);

// Courses of a student
router.get(
  "/getclassesofstudent/:id",
  adminOnly("read", SUBJECT),
  validate(schema.read),
  asyncHandler(async (req, res) => res.json(await service.getCoursesOfStudent(req.params.id)))
);

router.post(
  "/addStudentToCourse",
  adminOnly("create", SUBJECT),
  validate(schema.create),
  asyncHandler(async (req, res) => res.status(201).json(await service.addStudent(req.body)))
);

router.put(
  "/doneTask/:userId/:courseId/:taskId",
  adminOnly("update", SUBJECT),
  validate(schema.updateDone),
  asyncHandler(async (req, res) => {
    const { userId, courseId, taskId } = req.params;
    res.json(await service.markTaskDone(userId, courseId, taskId));
  })
);

router.put(
  "/:userId/:courseId",
  adminOnly("update", SUBJECT),
  validate(schema.update),
  asyncHandler(async (req, res) => {
    const { userId, courseId } = req.params;
    res.json(await service.updateStudent(userId, courseId, req.body));
  })
);

router.delete(
  "/:userId/:courseId",
  adminOnly("delete", SUBJECT),
  validate(schema.remove),
  asyncHandler(async (req, res) => {
    await service.removeStudent(req.params.userId, req.params.courseId);
    res.status(204).end();
  })
);

module.exports = router;
