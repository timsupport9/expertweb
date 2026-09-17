const { ok, fail } = require("../utils/response");

class BaseController {
  success(res, data, message = "Success", status = 200) {
    return ok(res, data, message, status);
  }

  error(res, message, status = 400, details) {
    return fail(res, message, status, details);
  }
}
module.exports = BaseController;
