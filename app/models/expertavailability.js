class ExpertAvailability {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "expert_availabilitys";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = ExpertAvailability;
