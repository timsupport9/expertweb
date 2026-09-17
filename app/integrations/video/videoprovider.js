class VideoProvider {
  async createMeeting(payload = {}) {
    return { provider: "VideoProvider", status: "not_configured", payload };
  }
}
module.exports = VideoProvider;
