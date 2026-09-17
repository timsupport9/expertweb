const BaseController = require("../baseController");
const AuthService = require("../../services/AuthService");

class LoginController extends BaseController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return this.error(res, "Email and password are required", 422);

      // User lookup should be connected to the existing database schema.
      return this.success(res, {
        message: "Authentication endpoint ready",
        email: String(email).toLowerCase().trim(),
        note: "Connect the existing users table lookup here."
      });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new LoginController();
