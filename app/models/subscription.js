class Subscription {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "subscriptions";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Subscription;
