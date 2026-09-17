class Role {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "roles";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Role;
