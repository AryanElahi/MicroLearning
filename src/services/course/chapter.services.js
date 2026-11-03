const prisma = require("../../lib/prisma");
const { pickDefined } = require("../../utils/sanitize");

const toData = (input) => ({
  ...pickDefined(input, ["title", "priority"]),
  ...(input.seasonId !== undefined && { seasonID: input.seasonId }),
});

const createChapter = (input) => prisma.chapter.create({ data: toData(input) });

const updateChapter = (id, input) => prisma.chapter.update({ where: { id }, data: toData(input) });

const getAllChapters = () => prisma.chapter.findMany({ orderBy: { id: "asc" } });

const getChapterById = (id) => prisma.chapter.findUnique({ where: { id } });

const getChaptersOfSeason = (seasonID) =>
  prisma.chapter.findMany({ where: { seasonID }, orderBy: { priority: "asc" } });

const deleteChapter = (id) => prisma.chapter.delete({ where: { id } });

module.exports = {
  createChapter,
  updateChapter,
  getAllChapters,
  getChapterById,
  getChaptersOfSeason,
  deleteChapter,
};
