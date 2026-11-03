const express = require("express");
const { adminOnly, isAuth, validate } = require("../../../middlewares");
const asyncHandler = require("../../../../utils/asyncHandler");
const ApiError = require("../../../../utils/ApiError");

/**
 * Builds the standard CRUD routes shared by course, season, chapter and task:
 *
 *   GET    {listPath}   list all
 *   GET    /:id         get one
 *   POST   /            create
 *   PUT    /:id         update
 *   DELETE /:id         delete
 *
 * Route-specific extras are registered through `extend(router)` *before* the
 * generic `/:id` routes so they are not shadowed by them.
 */
function crudRouter({ subject, schema, service, listPath, publicRead = false, extend }) {
  const router = express.Router();
  const canRead = publicRead ? [isAuth] : adminOnly("read", subject);

  router.get(
    listPath,
    canRead,
    asyncHandler(async (req, res) => res.json(await service.getAll()))
  );

  if (extend) extend(router, { canRead });

  router.get(
    "/:id",
    canRead,
    validate(schema.read),
    asyncHandler(async (req, res) => {
      const record = await service.getById(req.params.id);
      if (!record) throw ApiError.notFound(`${subject} not found`);
      res.json(record);
    })
  );

  router.post(
    "/",
    adminOnly("create", subject),
    validate(schema.create),
    asyncHandler(async (req, res) => res.status(201).json(await service.create(req.body)))
  );

  router.put(
    "/:id",
    adminOnly("update", subject),
    validate(schema.update),
    asyncHandler(async (req, res) => res.json(await service.update(req.params.id, req.body)))
  );

  router.delete(
    "/:id",
    adminOnly("delete", subject),
    validate(schema.remove),
    asyncHandler(async (req, res) => {
      await service.remove(req.params.id);
      res.status(204).end();
    })
  );

  return router;
}

/** `PUT /lock/:id` for resources that can be locked. */
const lockRoute = (router, { subject, schema, setLockStatus }) =>
  router.put(
    "/lock/:id",
    adminOnly("update", subject),
    validate(schema.lock),
    asyncHandler(async (req, res) =>
      res.json(await setLockStatus(req.params.id, req.body.lockStatus))
    )
  );

module.exports = { crudRouter, lockRoute };
