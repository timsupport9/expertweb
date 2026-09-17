class EventRegistration {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "event_registrations";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = EventRegistration;
