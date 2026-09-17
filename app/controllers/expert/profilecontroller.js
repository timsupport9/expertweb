const BaseController = require("../baseController");

class ProfileController extends BaseController {
  async index(req, res, next) {
    try {
      return this.success(res, { area: "expert", action: "index" });
    } catch (error) {
      next(error);
    }
  }

  async show(req, res, next) {
    try {
      return this.success(res, { id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();
