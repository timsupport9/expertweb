class Certificate {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "certificates";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Certificate;
