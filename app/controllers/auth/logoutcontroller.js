const BaseController = require("../baseController");
class LogoutController extends BaseController {
  async logout(req, res) {
    res.clearCookie("token");
    return this.success(res, null, "Logged out successfully");
  }
}
module.exports = new LogoutController();
