class Lesson {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "lessons";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Lesson;
