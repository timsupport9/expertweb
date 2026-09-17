class FAQ {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "faqs";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = FAQ;
