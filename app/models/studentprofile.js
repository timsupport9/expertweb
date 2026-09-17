class StudentProfile {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "student_profiles";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = StudentProfile;
