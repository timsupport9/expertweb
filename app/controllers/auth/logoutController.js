const Auth = require("../../utils/Auth");
const userRepo = require("../../repositories/UserRepository");
const sessionAuth = new Auth({ make: () => userRepo });
module.exports = async function logoutController(req, res, next) { try { await sessionAuth.logout(req); const wantsJson = req.originalUrl.startsWith("/api/") || req.headers.accept?.includes("application/json") || req.is("application/json"); if (wantsJson) return res.status(200).json({ success: true, message: "Signed out." }); return res.redirect("/login"); } catch (err) { return next(err); } };
