class RewardTransaction {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "reward_transactions";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = RewardTransaction;
