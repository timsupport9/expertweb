class Webinar {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "webinars";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Webinar;
