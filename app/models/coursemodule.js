class CourseModule {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "course_modules";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = CourseModule;
