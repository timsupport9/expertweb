let pino = null;
try { pino = require("pino"); } catch { /* fallback */ }

module.exports = function createLogger() {
  const env = process.env.NODE_ENV || "development";
  const level = process.env.LOG_LEVEL || (env === "production" ? "info" : "debug");

  if (pino) {
    return pino({
      level,
      base: { app: process.env.APP_NAME || "ExpertHub", env },
      timestamp: pino.stdTimeFunctions.isoTime,
      transport: env === "production"
        ? undefined
        : {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" },
          },
    });
  }

  const levels = { debug: 10, info: 20, warn: 30, error: 40, fatal: 50 };
  const threshold = levels[level] ?? 20;
  const mk = (name, num, sink) => (...args) => {
    if (num < threshold) return;
    sink(`[${name.toUpperCase()}]`, ...args);
  };

  return {
    debug: mk("debug", 10, console.debug.bind(console)),
    info:  mk("info",  20, console.info.bind(console)),
    warn:  mk("warn",  30, console.warn.bind(console)),
    error: mk("error", 40, console.error.bind(console)),
    fatal: mk("fatal", 50, console.error.bind(console)),
  };
};
