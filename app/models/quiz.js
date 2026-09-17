class Quiz {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "quizzes";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Quiz;
