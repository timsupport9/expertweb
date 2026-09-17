class Notification {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "notifications";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Notification;
