const express = require("express");
const { adminOnly } = require("../../../middlewares");
const { uploadMedia } = require("../../../../services/upload.services");
const asyncHandler = require("../../../../utils/asyncHandler");

const router = express.Router();

router.post(
  "/",
  adminOnly("create", "Task"),
  asyncHandler(async (req, res) => {
    res.status(201).json(await uploadMedia(req));
  })
);

module.exports = router;
