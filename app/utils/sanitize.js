function stripTags(value) {
  return String(value ?? "").replace(/<[^>]*>/g, "");
}
function cleanObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [
    k, typeof v === "string" ? stripTags(v).trim() : v
  ]));
}
module.exports = { stripTags, cleanObject };
