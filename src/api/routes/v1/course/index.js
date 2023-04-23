const express = require("express");
const course = require("./course.CRUD");
const season = require("./season.CRUD");
const chapter = require("./chapter.CRUD");
const classRoutes = require("./class.CRUD");
const studentOnClass = require("./studentOnClass.CRUD");
const task = require("./task.CRUD");

const courseLoader = () => {
  const router = express.Router();
  router.use("/", course);
  router.use("/season", season);
  router.use("/chapter", chapter);
  router.use("/class", classRoutes);
  router.use("/studentOnClass", studentOnClass);
  router.use("/task", task);

  return router;
};

module.exports = courseLoader;
