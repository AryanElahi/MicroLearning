const { validate } = require("../../../middlewares");
const schema = require("../../../../validation/validation.chapter.services");
const service = require("../../../../services/course/chapter.services");
const asyncHandler = require("../../../../utils/asyncHandler");
const { crudRouter } = require("./crudRouter");

module.exports = crudRouter({
  subject: "Chapter",
  schema,
  listPath: "/getAllChapters",
  service: {
    getAll: service.getAllChapters,
    getById: service.getChapterById,
    create: service.createChapter,
    update: service.updateChapter,
    remove: service.deleteChapter,
  },
  extend: (router, { canRead }) =>
    router.get(
      "/getChaptersOfSeason/:id",
      canRead,
      validate(schema.read),
      asyncHandler(async (req, res) => res.json(await service.getChaptersOfSeason(req.params.id)))
    ),
});
