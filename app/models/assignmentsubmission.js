class AssignmentSubmission {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "assignment_submissions";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = AssignmentSubmission;
