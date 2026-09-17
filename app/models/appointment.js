class Appointment {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "appointments";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Appointment;
