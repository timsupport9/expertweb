class Event {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "events";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Event;
