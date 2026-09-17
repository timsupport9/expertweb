class SubscriptionPlan {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "subscription_plans";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = SubscriptionPlan;
