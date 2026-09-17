class Course {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "courses";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Course;
