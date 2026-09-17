class CourseCategory {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "course_categorys";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = CourseCategory;
