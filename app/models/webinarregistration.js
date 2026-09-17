class WebinarRegistration {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "webinar_registrations";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = WebinarRegistration;
