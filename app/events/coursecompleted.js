class CourseCompleted {
  constructor(payload = {}) {
    this.payload = payload;
    this.occurredAt = new Date();
  }
}
module.exports = CourseCompleted;
