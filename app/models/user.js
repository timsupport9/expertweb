class User {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "users";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = User;
