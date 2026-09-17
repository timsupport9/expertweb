const express = require("express");
const router = express.Router();

const webRoutes = require("./web");
const apiRoutes = require("./api");

router.use("/api", apiRoutes);
router.use("/", webRoutes);

module.exports = router;
