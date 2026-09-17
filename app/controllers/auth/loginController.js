const authService = require("../../services/AuthService");
const Auth = require("../../utils/Auth");
const userRepo = require("../../repositories/UserRepository");
const sessionAuth = new Auth({ make: () => userRepo });
module.exports = async function loginController(req, res, next) { try { const { email, password, next: nextUrl } = req.body || {}; const user = await authService.login({ email, password }, req.ip); await sessionAuth.login(req, user); req.user = { id: user.id, name: user.name, email: user.email, role: user.role }; res.locals.user = req.user; const wantsJson = req.originalUrl.startsWith("/api/") || req.headers.accept?.includes("application/json") || req.is("application/json"); if (wantsJson) return res.status(200).json({ success: true, message: "Signed in.", user: req.user }); const redirect = typeof nextUrl === "string" && nextUrl.startsWith("/") ? nextUrl : "/dashboard"; return res.redirect(redirect); } catch (err) { return next(err); } };
