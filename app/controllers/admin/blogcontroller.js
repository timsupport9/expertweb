const BaseController = require("../baseController");

class BlogController extends BaseController {
  async index(req, res, next) {
    try {
      return this.success(res, { area: "admin", action: "index" });
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

module.exports = new BlogController();
