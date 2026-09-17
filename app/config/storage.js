const path = require("path");

module.exports = {
  uploadRoot: path.join(__dirname, "../../public/uploads"),
  temporaryRoot: path.join(__dirname, "../../public/uploads/temporary"),
  maxFileSize: Number(process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024)
};
