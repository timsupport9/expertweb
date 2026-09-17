const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const courseController = require("../controllers/courseController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

router.get("/health", (req, res) => {
  res.json({ success: true, service: "ExpertHub", status: "ok", ts: Date.now() });
});

// Auth under /api/auth
router.use("/auth", authRoutes);

// Courses
router.get("/courses", courseController.listJson);
router.post(
  "/courses",
  requireAuth(),
  requireRole("expert", "admin"),
  courseController.create
);

module.exports = router;
