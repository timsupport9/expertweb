const BaseService = require("./BaseService");
const repository = require("../repositories/Notification");

class NotificationService extends BaseService {
  constructor() {
    super(repository);
  }

  async create(data) {
    if (!data || typeof data !== "object") throw new Error("Data is required");
    if (!repository) return data;
    // Create/update methods can be extended to match your existing database schema.
    return data;
  }
}

module.exports = new NotificationService();
