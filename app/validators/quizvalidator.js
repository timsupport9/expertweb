module.exports = function validate(payload = {}) {
  if (!payload || typeof payload !== "object") {
    return ["Payload must be an object"];
  }
  return true;
};
