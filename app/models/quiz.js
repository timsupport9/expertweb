class Quiz {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "quizs";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Quiz;
