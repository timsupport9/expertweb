class Conversation {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "conversations";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Conversation;
