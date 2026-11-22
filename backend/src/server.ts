import { app } from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function start() {
  await connectDB();
  const server = app.listen(env.PORT, () => {
    console.log(`Admin backend listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(async () => {
      await disconnectDB().catch(() => undefined);
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
