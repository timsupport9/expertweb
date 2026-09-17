const BaseController = require("../baseController");
const AuthService = require("../../services/AuthService");

class RegisterController extends BaseController {
  async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      return this.success(res, user, "Registration payload validated", 201);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new RegisterController();
