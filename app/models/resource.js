class Resource {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "resources";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Resource;
