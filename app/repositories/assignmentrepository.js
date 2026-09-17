const BaseRepository = require("./BaseRepository");
const Assignment = require("../models/Assignment");

class AssignmentRepository extends BaseRepository {
  constructor() {
    super(Assignment);
  }
}

module.exports = new AssignmentRepository();
