class CourseCompletionListener {
  async handle(event) {
    return { handled: true, listener: "CourseCompletionListener", event };
  }
}
module.exports = new CourseCompletionListener();
