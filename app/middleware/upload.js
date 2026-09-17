const multer = require("multer");
const path = require("path");
const fs = require("fs");
const storageConfig = require("../config/storage");

fs.mkdirSync(storageConfig.temporaryRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: storageConfig.temporaryRoot,
  filename: (req, file, cb) => {
    const safe = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});

module.exports = multer({
  storage,
  limits: { fileSize: storageConfig.maxFileSize }
});
