class LessonProgress {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "lesson_progresss";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = LessonProgress;
