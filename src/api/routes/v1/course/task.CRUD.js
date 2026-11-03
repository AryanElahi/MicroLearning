const { adminOnly, validate } = require("../../../middlewares");
const schema = require("../../../../validation/validation.task.services");
const service = require("../../../../services/course/task.services");
const { uploadMedia } = require("../../../../services/upload.services");
const asyncHandler = require("../../../../utils/asyncHandler");
const { crudRouter } = require("./crudRouter");

module.exports = crudRouter({
  subject: "Task",
  schema,
  listPath: "/getalltasks",
  service: {
    getAll: service.getAllTasks,
    getById: service.getTaskById,
    create: service.createTask,
    update: service.updateTask,
    remove: service.deleteTask,
  },
  extend: (router, { canRead }) => {
    router.get(
      "/gettasksofchapter/:id",
      canRead,
      validate(schema.read),
      asyncHandler(async (req, res) => res.json(await service.getTasksOfChapter(req.params.id)))
    );
    router.post(
      "/upload",
      adminOnly("create", "Task"),
      asyncHandler(async (req, res) => res.status(201).json(await uploadMedia(req)))
    );
  },
});
