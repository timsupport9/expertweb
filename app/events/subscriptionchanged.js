class SubscriptionChanged {
  constructor(payload = {}) {
    this.payload = payload;
    this.occurredAt = new Date();
  }
}
module.exports = SubscriptionChanged;
