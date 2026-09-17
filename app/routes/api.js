const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ success: true, service: "ExpertHub API", version: "1.0.0" });
});

router.get("/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});

router.use("/auth", require("./auth"));
router.use("/student", require("./student"));
router.use("/expert", require("./expert"));
router.use("/corporate", require("./corporate"));
router.use("/admin", require("./admin"));
router.use("/courses", require("./courses"));
router.use("/consultations", require("./consultations"));
router.use("/appointments", require("./appointments"));
router.use("/events", require("./events"));
router.use("/webinars", require("./webinars"));
router.use("/payments", require("./payments"));
router.use("/subscriptions", require("./subscriptions"));
router.use("/notifications", require("./notifications"));
router.use("/messages", require("./messages"));
router.use("/referrals", require("./referrals"));
router.use("/search", require("./search"));
router.use("/reports", require("./reports"));
router.use("/webhooks", require("./webhooks"));

module.exports = router;
