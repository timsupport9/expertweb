const express = require("express");
const router = express.Router();

router.use("/api", require("./api"));
router.use("/", require("./web"));

module.exports = router;
