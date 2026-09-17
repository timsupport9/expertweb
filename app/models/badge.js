class Badge {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "badges";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Badge;
