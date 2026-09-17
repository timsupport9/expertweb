class Assignment {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "assignments";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Assignment;
