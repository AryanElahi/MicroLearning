const prisma = require("../../lib/prisma");
const { pickDefined } = require("../../utils/sanitize");

const toData = (input) => ({
  ...pickDefined(input, ["title", "priority", "content", "timeToRead", "type"]),
  ...(input.chapterId !== undefined && { chapterID: input.chapterId }),
});

const createTask = (input) => prisma.task.create({ data: { content: {}, ...toData(input) } });

const updateTask = (id, input) => prisma.task.update({ where: { id }, data: toData(input) });

const getAllTasks = () => prisma.task.findMany({ orderBy: { id: "asc" } });

const getTaskById = (id) => prisma.task.findUnique({ where: { id } });

const getTasksOfChapter = (chapterID) =>
  prisma.task.findMany({ where: { chapterID }, orderBy: { priority: "asc" } });

const deleteTask = (id) => prisma.task.delete({ where: { id } });

module.exports = {
  createTask,
  updateTask,
  getAllTasks,
  getTaskById,
  getTasksOfChapter,
  deleteTask,
};
