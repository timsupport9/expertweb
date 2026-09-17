class QuizQuestion {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "quiz_questions";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = QuizQuestion;
