class VideoSession {
  constructor(attributes = {}) {
    Object.assign(this, attributes);
  }

  static get table() {
    return "video_sessions";
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = VideoSession;
