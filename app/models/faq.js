class FAQ {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "f_a_qs";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = FAQ;
