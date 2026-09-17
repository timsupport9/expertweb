function now() { return new Date(); }
function addMinutes(date, minutes) {
  return new Date(new Date(date).getTime() + Number(minutes) * 60000);
}
function isPast(date) { return new Date(date).getTime() < Date.now(); }

module.exports = { now, addMinutes, isPast };
