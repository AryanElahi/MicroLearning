const prisma = require("../../lib/prisma");
const { pickDefined } = require("../../utils/sanitize");

const DEFAULT_DURATION_MS = 180 * 24 * 60 * 60 * 1000; // ~6 months

const toData = (input) => ({
  ...pickDefined(input, ["title", "startTime", "endTime", "capacity", "isLocked"]),
  ...(input.courseId !== undefined && { courseID: input.courseId }),
  ...(input.mentorId !== undefined && { mentorID: input.mentorId }),
});

const createClass = (input) => {
  const startTime = input.startTime || new Date();
  const endTime = input.endTime || new Date(new Date(startTime).getTime() + DEFAULT_DURATION_MS);
  return prisma.class.create({ data: { ...toData(input), startTime, endTime } });
};

const updateClass = (id, input) => prisma.class.update({ where: { id }, data: toData(input) });

const setLockStatus = (id, isLocked) => prisma.class.update({ where: { id }, data: { isLocked } });

const getAllClasses = () => prisma.class.findMany({ orderBy: { id: "asc" } });

const getClassById = (id) => prisma.class.findUnique({ where: { id } });

const deleteClass = (id) => prisma.class.delete({ where: { id } });

module.exports = {
  createClass,
  updateClass,
  setLockStatus,
  getAllClasses,
  getClassById,
  deleteClass,
};
