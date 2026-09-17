class ExpertProfile {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "expert_profiles";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = ExpertProfile;
