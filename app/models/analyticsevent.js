class AnalyticsEvent {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "analytics_events";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = AnalyticsEvent;
