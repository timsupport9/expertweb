class Consultation {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "consultations";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Consultation;
