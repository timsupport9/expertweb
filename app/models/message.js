class Message {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "messages";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Message;
