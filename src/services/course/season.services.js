const prisma = require("../../lib/prisma");
const { pickDefined } = require("../../utils/sanitize");

const toData = (input) => ({
  ...pickDefined(input, ["title", "priority"]),
  ...(input.courseId !== undefined && { courseID: input.courseId }),
});

const createSeason = (input) => prisma.season.create({ data: toData(input) });

const updateSeason = (id, input) => prisma.season.update({ where: { id }, data: toData(input) });

const getAllSeasons = () => prisma.season.findMany({ orderBy: { id: "asc" } });

const getSeasonById = (id) => prisma.season.findUnique({ where: { id } });

const getSeasonsOfCourse = (courseID) =>
  prisma.season.findMany({ where: { courseID }, orderBy: { priority: "asc" } });

const deleteSeason = (id) => prisma.season.delete({ where: { id } });

module.exports = {
  createSeason,
  updateSeason,
  getAllSeasons,
  getSeasonById,
  getSeasonsOfCourse,
  deleteSeason,
};
