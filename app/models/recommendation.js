class Recommendation {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "recommendations";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Recommendation;
