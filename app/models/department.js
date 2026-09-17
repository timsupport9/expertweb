class Department {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "departments";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Department;
