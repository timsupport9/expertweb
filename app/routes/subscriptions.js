const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ success: true, resource: "subscriptions", data: [] });
});

module.exports = router;
