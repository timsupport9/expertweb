class NotificationListener {
  async handle(event) {
    return { handled: true, listener: "NotificationListener", event };
  }
}
module.exports = new NotificationListener();
