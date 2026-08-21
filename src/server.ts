// src/server.ts
import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 3000;

// ============= SERVER STARTUP =============
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// ============= GRACEFUL SHUTDOWN =============
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
