const express = require("express");
const path = require("path");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");

const requestLogger = require("../middleware/requestLogger");
const securityHeaders = require("../middleware/securityHeaders");
const notFound = require("../middleware/notFound");
const errorHandler = require("../middleware/errorHandler");
const routes = require("../routes");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());
app.use(securityHeaders);
app.use(cors({
  origin: process.env.APP_URL || true,
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(requestLogger);

app.use(express.static(path.join(__dirname, "../../public")));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "ExpertHub",
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    time: new Date().toISOString()
  });
});

app.use(routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
