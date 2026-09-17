class AppointmentListener {
  async handle(event) {
    return { handled: true, listener: "AppointmentListener", event };
  }
}
module.exports = new AppointmentListener();
