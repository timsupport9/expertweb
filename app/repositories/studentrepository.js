const BaseRepository = require("./BaseRepository");
const StudentProfile = require("../models/StudentProfile");

class StudentRepository extends BaseRepository {
  constructor() {
    super(StudentProfile);
  }
}

module.exports = new StudentRepository();
