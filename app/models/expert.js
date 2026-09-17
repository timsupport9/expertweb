class Expert {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "experts";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Expert;
