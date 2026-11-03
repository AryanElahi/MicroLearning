const express = require("express");
const { adminOnly, validate } = require("../../../middlewares");
const schema = require("../../../../validation/validation.studentOnClass.services");
const service = require("../../../../services/course/studentOnClass.services");
const asyncHandler = require("../../../../utils/asyncHandler");
const ApiError = require("../../../../utils/ApiError");

const SUBJECT = "StudentOnClass";
const router = express.Router();

router.get(
  "/getAllstudentsOnClass/:id",
  adminOnly("read", SUBJECT),
  validate(schema.read),
  asyncHandler(async (req, res) => res.json(await service.getStudentsOfClass(req.params.id)))
);

router.get(
  "/getStudentById/:userId/:classId",
  adminOnly("read", SUBJECT),
  validate(schema.readStudentOnClass),
  asyncHandler(async (req, res) => {
    const record = await service.getStudentOnClass(req.params.userId, req.params.classId);
    if (!record) throw ApiError.notFound("This student is not enrolled in this class");
    res.json(record);
  })
);

router.get(
  "/getclassesofstudent/:id",
  adminOnly("read", SUBJECT),
  validate(schema.read),
  asyncHandler(async (req, res) => res.json(await service.getClassesOfStudent(req.params.id)))
);

router.post(
  "/addStudentToClass",
  adminOnly("create", SUBJECT),
  validate(schema.create),
  asyncHandler(async (req, res) => res.status(201).json(await service.addStudent(req.body)))
);

router.put(
  "/doneTask/:userId/:classId/:taskId",
  adminOnly("update", SUBJECT),
  validate(schema.updateDone),
  asyncHandler(async (req, res) => {
    const { userId, classId, taskId } = req.params;
    res.json(await service.markTaskDone(userId, classId, taskId));
  })
);

router.put(
  "/:userId/:classId",
  adminOnly("update", SUBJECT),
  validate(schema.update),
  asyncHandler(async (req, res) => {
    const { userId, classId } = req.params;
    res.json(await service.updateStudent(userId, classId, req.body));
  })
);

router.delete(
  "/:userId/:classId",
  adminOnly("delete", SUBJECT),
  validate(schema.remove),
  asyncHandler(async (req, res) => {
    await service.removeStudent(req.params.userId, req.params.classId);
    res.status(204).end();
  })
);

module.exports = router;
