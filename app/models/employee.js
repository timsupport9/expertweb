class Employee {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "employees";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Employee;
