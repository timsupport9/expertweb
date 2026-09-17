class StorageProvider {
  async put(payload = {}) {
    return { provider: "StorageProvider", status: "not_configured", payload };
  }
}
module.exports = StorageProvider;
