const { validate } = require("../../../middlewares");
const schema = require("../../../../validation/validation.season.services");
const service = require("../../../../services/course/season.services");
const asyncHandler = require("../../../../utils/asyncHandler");
const { crudRouter } = require("./crudRouter");

module.exports = crudRouter({
  subject: "Season",
  schema,
  listPath: "/getAllSeasons",
  service: {
    getAll: service.getAllSeasons,
    getById: service.getSeasonById,
    create: service.createSeason,
    update: service.updateSeason,
    remove: service.deleteSeason,
  },
  extend: (router, { canRead }) =>
    router.get(
      "/getSeasonsOfCourse/:id",
      canRead,
      validate(schema.read),
      asyncHandler(async (req, res) => res.json(await service.getSeasonsOfCourse(req.params.id)))
    ),
});
