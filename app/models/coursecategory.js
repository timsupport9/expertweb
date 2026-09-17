class CourseCategory {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "course_categories";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = CourseCategory;
