const BaseRepository = require("./BaseRepository");
const Enrollment = require("../models/Enrollment");

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super(Enrollment);
  }
}

module.exports = new EnrollmentRepository();
