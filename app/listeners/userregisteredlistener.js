class UserRegisteredListener {
  async handle(event) {
    return { handled: true, listener: "UserRegisteredListener", event };
  }
}
module.exports = new UserRegisteredListener();
