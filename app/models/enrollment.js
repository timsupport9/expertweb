class Enrollment {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "enrollments";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Enrollment;
