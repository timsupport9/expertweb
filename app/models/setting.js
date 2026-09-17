class Setting {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "settings";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Setting;
