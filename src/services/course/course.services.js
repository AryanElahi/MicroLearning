const prisma = require("../../lib/prisma");
const { pickDefined } = require("../../utils/sanitize");

const DEFAULT_DURATION_MS = 180 * 24 * 60 * 60 * 1000; // ~6 months

const toData = (input) => ({
  ...pickDefined(input, [
    "title",
    "description",
    "rate",
    "taskcount",
    "isLocked",
    "startTime",
    "endTime",
  ]),
  ...(input.teacherId !== undefined && { teacherID: input.teacherId }),
  ...(input.mentorId !== undefined && { mentorID: input.mentorId }),
});

/** The mentor defaults to the teacher and the course runs ~6 months by default. */
const createCourse = (input) => {
  const startTime = input.startTime || new Date();
  const endTime = input.endTime || new Date(new Date(startTime).getTime() + DEFAULT_DURATION_MS);
  const mentorId = input.mentorId !== undefined ? input.mentorId : input.teacherId;
  return prisma.course.create({
    data: toData({ ...input, mentorId, startTime, endTime }),
  });
};

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
