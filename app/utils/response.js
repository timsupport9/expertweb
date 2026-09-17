function ok(res, data = null, message = "Success", status = 200) {
  return res.status(status).json({ success: true, message, data });
}
function fail(res, message = "Request failed", status = 400, details = undefined) {
  return res.status(status).json({
    success: false,
    error: message,
    ...(details === undefined ? {} : { details })
  });
}
module.exports = { ok, fail };
