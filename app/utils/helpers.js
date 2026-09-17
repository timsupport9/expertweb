const crypto = require("node:crypto");

const env = (key, fallback = null) => {
  const v = process.env[key];
  return v === undefined || v === "" ? fallback : v;
};

const envBool = (key, fallback = false) => {
  const v = env(key);
  if (v === null) return fallback;
  return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
};

const envInt = (key, fallback = 0) => {
  const v = env(key);
  const n = parseInt(v ?? "", 10);
  return Number.isNaN(n) ? fallback : n;
};

const slug = (value) =>
  String(value).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const now = () => new Date().toISOString().slice(0, 19).replace("T", " ");

const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

const escapeHtml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

module.exports = { env, envBool, envInt, slug, now, randomToken, escapeHtml };
