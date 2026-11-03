/**
 * Enrollment of students in courses (the `studentsOnClass` table; classes were
 * merged into courses, the table name was kept to avoid a data migration).
 */
const prisma = require("../../lib/prisma");
const ApiError = require("../../utils/ApiError");
const { pickDefined } = require("../../utils/sanitize");

const EDITABLE_FIELDS = ["mark", "progress", "startTime", "endTime"];
const NOT_ENROLLED = "This student is not enrolled in this course";

const getEnrollment = (userID, courseID) =>
  prisma.studentsOnClass.findFirst({ where: { userID, courseID } });

const getRequired = async (userID, courseID) => {
  const record = await getEnrollment(userID, courseID);
  if (!record) throw ApiError.notFound(NOT_ENROLLED);
  return record;
};

async function addStudent({ userId, courseId, ...rest }) {
  if (await getEnrollment(userId, courseId)) {
    throw ApiError.conflict("This student is already enrolled in this course");
  }
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw ApiError.notFound("Course not found");
  if (course.isLocked) throw ApiError.badRequest("This course is locked");
  return prisma.studentsOnClass.create({
    data: {
      userID: userId,
      courseID: courseId,
      ...pickDefined(rest, EDITABLE_FIELDS),
    },
  });
}

async function updateStudent(userId, courseId, changes) {
  const record = await getRequired(userId, courseId);
  return prisma.studentsOnClass.update({
    where: { id: record.id },
    data: pickDefined(changes, EDITABLE_FIELDS),
  });
}

/** Marks a task as done for a student (idempotent). */
async function markTaskDone(userId, courseId, taskId) {
  const record = await getRequired(userId, courseId);
  if (record.done.includes(taskId)) return record;
  return prisma.studentsOnClass.update({
    where: { id: record.id },
    data: { done: { push: taskId } },
  });
}

const getStudentsOfCourse = (courseID) => prisma.studentsOnClass.findMany({ where: { courseID } });

const getCoursesOfStudent = (userID) => prisma.studentsOnClass.findMany({ where: { userID } });

async function removeStudent(userId, courseId) {
  const record = await getRequired(userId, courseId);
  await prisma.studentsOnClass.delete({ where: { id: record.id } });
}

module.exports = {
  NOT_ENROLLED,
  addStudent,
  updateStudent,
  markTaskDone,
  getStudentsOfCourse,
  getCoursesOfStudent,
  getEnrollment,
  removeStudent,
};
