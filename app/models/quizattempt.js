class QuizAttempt {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "quiz_attempts";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = QuizAttempt;
