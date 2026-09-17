class Permission {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "permissions";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Permission;
