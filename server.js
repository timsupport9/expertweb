require("dotenv").config();

const http = require("http");
const app = require("./app/config/app");
const database = require("./app/config/database");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`ExpertHub running on http://${HOST}:${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down ExpertHub...`);

  server.close(async () => {
    try {
      if (database && typeof database.close === "function") {
        await database.close();
      }

      console.log("ExpertHub shut down successfully.");
      process.exit(0);
    } catch (error) {
      console.error("Shutdown error:", error);
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));