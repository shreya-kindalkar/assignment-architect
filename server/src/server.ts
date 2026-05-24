import { createServer } from "http";
import app from "./app.js";
import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { initSocketServer } from "./sockets/socket.manager.js";
import { initBackgroundWorkers } from "./workers/worker.manager.js";
import mongoose from "mongoose";

const server = createServer(app);

async function startServer() {
  console.log("[Server Bootstrap] Initializing VedaAI Backend Engine...");

  // 1. Establish Database Connection (Graceful mock fallback if absent)
  await connectDB();

  // 2. Initialize Socket.IO Server
  initSocketServer(server);
  console.log("[Server Bootstrap] Socket.IO server initialized.");

  // 3. Launch Heavy Async Workers (BullMQ or resilient Event Mock)
  initBackgroundWorkers();
  console.log("[Server Bootstrap] Background workers activated.");

  // 4. Listen on Designated Port
  const port = config.port;
  server.listen(port, () => {
    console.log(`====================================================`);
    console.log(` VedaAI Backend Server is running in [${config.nodeEnv}] mode`);
    console.log(` Local Endpoint:  http://localhost:${port}`);
    console.log(` WebSocket Host:  ws://localhost:${port}`);
    console.log(`====================================================`);
  });
}

// Graceful shutdown handling
function handleShutdown(signal: string) {
  console.log(`[Graceful Shutdown] Received ${signal}. Closing server connections...`);
  server.close(async () => {
    console.log("[Graceful Shutdown] HTTP Server closed.");
    try {
      await mongoose.disconnect();
      console.log("[Graceful Shutdown] Mongoose disconnected safely.");
    } catch (err) {
      console.error("[Graceful Shutdown] Error disconnecting Mongoose:", err);
    }
    process.exit(0);
  });

  // Safe timeout exit if connections refuse to close in 5 seconds
  setTimeout(() => {
    console.warn("[Graceful Shutdown] Forced shutdown after timeout.");
    process.exit(1);
  }, 5000);
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

// Execute bootstrap
startServer().catch((err) => {
  console.error("[Server Bootstrap Failed] Fatal error starting server:", err);
  process.exit(1);
});
