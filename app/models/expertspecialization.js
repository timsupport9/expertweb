class ExpertSpecialization {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "expert_specializations";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = ExpertSpecialization;
