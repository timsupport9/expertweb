const express = require("express");
const router = express.Router();

const loginController = require("../controllers/auth/loginController");
const registerController = require("../controllers/auth/registerController");
const logoutController = require("../controllers/auth/logoutController");
const meController = require("../controllers/auth/meController");
const forgotPasswordController = require("../controllers/auth/forgotPasswordController");
const resetPasswordController = require("../controllers/auth/resetPasswordController");

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/logout", logoutController);
router.get("/logout", logoutController);
router.get("/me", meController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

module.exports = router;
