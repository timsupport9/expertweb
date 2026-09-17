class Payment {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "payments";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Payment;
