const prisma = require("../../lib/prisma");
const { pickDefined } = require("../../utils/sanitize");

const toData = (input) => ({
  ...pickDefined(input, ["title", "description", "rate", "taskcount", "isLocked"]),
  ...(input.teacherId !== undefined && { teacherID: input.teacherId }),
});

const createCourse = (input) => prisma.course.create({ data: toData(input) });

const updateCourse = (id, input) => prisma.course.update({ where: { id }, data: toData(input) });

const setLockStatus = (id, isLocked) => prisma.course.update({ where: { id }, data: { isLocked } });

const getAllCourses = () => prisma.course.findMany({ orderBy: { id: "asc" } });

const getCourseById = (id) => prisma.course.findUnique({ where: { id } });

const deleteCourse = (id) => prisma.course.delete({ where: { id } });

module.exports = {
  createCourse,
  updateCourse,
  setLockStatus,
  getAllCourses,
  getCourseById,
  deleteCourse,
};
