/**
 * ============================================================
 * EXPERTHUB — BACKEND EXPRESS APPLICATION
 * ============================================================
 *
 * File:
 *     app/config/app.js
 *
 * PURPOSE:
 *     Backend/API application only.
 *
 * IMPORTANT:
 *     This file DOES NOT:
 *       - serve frontend HTML
 *       - serve CSS
 *       - serve JavaScript
 *       - serve images
 *       - serve public/assets
 *       - redirect users to /dashboard
 *       - use Express sessions
 *       - use flash messages
 *       - use server-rendered pages
 *
 * FRONTEND:
 *     The frontend communicates with this backend through:
 *
 *     /api
 *     /api/v1
 *
 * EXAMPLE:
 *
 *     GET  /api/v1/health
 *     POST /api/v1/auth/login
 *     POST /api/v1/auth/register
 *     GET  /api/v1/auth/me
 *
 * SERVER:
 *     server.js is responsible for starting the HTTP server.
 *
 * ============================================================
 */

"use strict";

const express = require("express");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const crypto = require("crypto");

/* ------------------------------------------------------------------
 * Configuration
 * ---------------------------------------------------------------- */

const {
  buildHelmetOptions,
  securityHeaders,
} = require("./security");

const buildCorsOptions = require("./cors");

/* ------------------------------------------------------------------
 * Middleware
 * ---------------------------------------------------------------- */

const requestLogger = require("../middleware/requestLogger");
const notFound = require("../middleware/notFound");
const errorHandler = require("../middleware/errorHandler");

/* ------------------------------------------------------------------
 * Routes
 * ---------------------------------------------------------------- */

const routes = require("../routes");

/* ------------------------------------------------------------------
 * Application
 * ---------------------------------------------------------------- */

const app = express();

const isProduction =
  (process.env.NODE_ENV || "development").toLowerCase() === "production";

/* ==================================================================
 * APPLICATION IDENTITY
 * ================================================================== */

app.disable("x-powered-by");

/*
 * Required when deployed behind Render, Nginx, Cloudflare,
 * load balancers or another reverse proxy.
 */
app.set("trust proxy", 1);

/*
 * Disable Express view engine because this is an API backend.
 */
app.set("view engine", false);

/* ==================================================================
 * REQUEST ID
 * ==================================================================
 *
 * Every request receives a unique ID.
 *
 * This makes it much easier to trace:
 *
 *   frontend request
 *        ↓
 *   Render log
 *        ↓
 *   controller
 *        ↓
 *   database
 *
 * The frontend can also read:
 *
 *     X-Request-ID
 *
 * ================================================================== */

app.use((req, res, next) => {
  const incomingId = req.headers["x-request-id"];

  const requestId =
    typeof incomingId === "string" && incomingId.length <= 128
      ? incomingId
      : crypto.randomUUID();

  req.id = requestId;

  res.setHeader("X-Request-ID", requestId);

  next();
});

/* ==================================================================
 * SECURITY HEADERS
 * ================================================================== */

app.use(
  helmet(
    buildHelmetOptions({
      isProduction,
    })
  )
);

app.use(securityHeaders);

/* ==================================================================
 * CORS
 * ==================================================================
 *
 * The frontend is hosted separately.
 *
 * Example:
 *
 *     Frontend:
 *     https://experthub-frontend.onrender.com
 *
 *     Backend:
 *     https://experthub-backend.onrender.com
 *
 * CORS is therefore required.
 *
 * Configure allowed frontend origins in environment variables.
 * ================================================================== */

app.use(cors(buildCorsOptions()));

/* ==================================================================
 * COMPRESSION
 * ================================================================== */

app.use(
  compression({
    threshold: 1024,
  })
);

/* ==================================================================
 * BODY PARSING
 * ==================================================================
 *
 * JSON is the normal API format.
 *
 * URL encoded data is retained for compatibility with forms
 * and selected integrations.
 * ================================================================== */

app.use(
  express.json({
    limit: process.env.JSON_BODY_LIMIT || "2mb",
    strict: true,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.URLENCODED_BODY_LIMIT || "2mb",
  })
);

/* ==================================================================
 * COOKIE PARSER
 * ==================================================================
 *
 * Useful if authentication uses HTTP-only cookies.
 *
 * The backend remains API-only; cookies are simply one possible
 * authentication transport.
 * ================================================================== */

app.use(cookieParser(process.env.COOKIE_SECRET || undefined));

/* ==================================================================
 * REQUEST LOGGER
 * ================================================================== */

app.use(requestLogger);

/* ==================================================================
 * API HEALTH CHECK
 * ==================================================================
 *
 * This endpoint does not require authentication.
 *
 * Useful for:
 *
 *     Render
 *     Uptime monitoring
 *     Deployment testing
 *     Frontend connection testing
 *
 * GET /health
 *
 * ================================================================== */

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "ExpertHub API",
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    version: process.env.APP_VERSION || "1.0.0",
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

/* ==================================================================
 * API READINESS CHECK
 * ==================================================================
 *
 * This endpoint can later be expanded to verify:
 *
 *     Database
 *     Redis
 *     Email
 *     Storage
 *     Payment services
 *
 * It deliberately does not expose secrets or connection details.
 * ================================================================== */

app.get("/ready", async (req, res, next) => {
  try {
    const checks = {
      api: true,
      database: true,
    };

    /*
     * If your database module exposes a health check, this section
     * can be connected to it.
     *
     * Example later:
     *
     * const database = require("./database");
     * checks.database = await database.healthCheck();
     */

    const ready = Object.values(checks).every(Boolean);

    return res.status(ready ? 200 : 503).json({
      success: ready,
      status: ready ? "ready" : "not_ready",
      service: "ExpertHub API",
      checks,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  } catch (error) {
    return next(error);
  }
});

/* ==================================================================
 * API INFORMATION
 * ==================================================================
 *
 * Gives the frontend/developer a simple way to verify which API
 * version the backend exposes.
 *
 * GET /api
 *
 * ================================================================== */

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    service: "ExpertHub API",
    version: process.env.API_VERSION || "v1",
    status: "online",
    documentation:
      process.env.API_DOCS_URL || "/api/v1/docs",
    endpoints: {
      health: "/health",
      readiness: "/ready",
      api: "/api",
      versionedApi: "/api/v1",
    },
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

/* ==================================================================
 * WEBHOOK RAW-BODY NOTE
 * ==================================================================
 *
 * Payment providers such as Stripe may require access to the raw
 * request body for signature verification.
 *
 * Do NOT automatically put express.raw() globally here because that
 * would interfere with normal JSON API requests.
 *
 * Payment-specific raw-body middleware should be placed on the
 * individual webhook route.
 * ================================================================== */

/* ==================================================================
 * APPLICATION ROUTES
 * ==================================================================
 *
 * All backend routes are mounted here.
 *
 * Recommended route structure:
 *
 *     /api/v1/auth
 *     /api/v1/users
 *     /api/v1/students
 *     /api/v1/experts
 *     /api/v1/corporates
 *     /api/v1/admin
 *     /api/v1/courses
 *     /api/v1/consultations
 *     /api/v1/appointments
 *     /api/v1/events
 *     /api/v1/payments
 *     /api/v1/notifications
 *     /api/v1/messages
 *     /api/v1/search
 *
 * The routes module should handle these.
 * ================================================================== */

app.use("/api", routes);

/* ==================================================================
 * OPTIONAL API VERSION ALIAS
 * ==================================================================
 *
 * If your routes currently expect /api/v1 directly, the routes
 * module can expose the version internally.
 *
 * Recommended:
 *
 *     routes/index.js
 *
 *     router.use("/v1", apiV1Routes)
 *
 * Result:
 *
 *     /api/v1/auth/login
 *     /api/v1/courses
 *     /api/v1/experts
 *
 * ================================================================== */

/* ==================================================================
 * BACKEND ROOT
 * ==================================================================
 *
 * Since this server is backend-only, "/" returns JSON instead of
 * trying to serve index.html.
 * ================================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "ExpertHub Backend API",
    status: "online",
    message: "ExpertHub backend is running successfully.",
    api: "/api",
    version: process.env.API_VERSION || "v1",
    health: "/health",
    readiness: "/ready",
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

/* ==================================================================
 * API 404 HANDLER
 * ==================================================================
 *
 * Handles requests that do not match an API route.
 * ================================================================== */

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({
      success: false,
      error: {
        code: "API_ROUTE_NOT_FOUND",
        message: "The requested API endpoint does not exist.",
        path: req.originalUrl,
        method: req.method,
        requestId: req.id,
      },
    });
  }

  next();
});

/* ==================================================================
 * GENERAL 404 HANDLER
 * ================================================================== */

app.use(notFound);

/* ==================================================================
 * CENTRAL ERROR HANDLER
 * ==================================================================
 *
 * This must remain the LAST middleware.
 * ================================================================== */

app.use(errorHandler);

/* ==================================================================
 * EXPORT
 * ================================================================== */

module.exports = app;