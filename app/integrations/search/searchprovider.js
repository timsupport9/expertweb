class SearchProvider {
  async search(payload = {}) {
    return { provider: "SearchProvider", status: "not_configured", payload };
  }
}
module.exports = SearchProvider;
