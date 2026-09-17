class ConversationParticipant {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "conversation_participants";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = ConversationParticipant;
