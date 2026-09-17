class ExpertReview {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "expert_reviews";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = ExpertReview;
