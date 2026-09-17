function toMinor(amount) {
  return Math.round(Number(amount) * 100);
}
function fromMinor(amount) {
  return Number(amount) / 100;
}
function format(amount, currency = process.env.CURRENCY || "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency
  }).format(Number(amount));
}
module.exports = { toMinor, fromMinor, format };
