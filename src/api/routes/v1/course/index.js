const express = require("express");
const course = require("./course.CRUD");
const season = require("./season.CRUD");
const chapter = require("./chapter.CRUD");
const studentOnClass = require("./studentOnClass.CRUD");
const task = require("./task.CRUD");

const courseLoader = () => {
  const router = express.Router();
  // Sub-resources first, so "/season/..." is not captured by the course "/:id".
  router.use("/season", season);
  router.use("/chapter", chapter);
  router.use("/studentOnClass", studentOnClass);
  router.use("/task", task);
  router.use("/", course);
  return router;
};

module.exports = courseLoader;
