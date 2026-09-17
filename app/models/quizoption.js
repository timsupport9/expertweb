class QuizOption {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "quiz_options";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = QuizOption;
