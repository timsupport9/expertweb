class UserRole {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "user_roles";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = UserRole;
