import app from "./app.js";
import { prisma } from "./db/prisma.js";

const PORT = Number(process.env.PORT || 3000);

const server = app.listen(PORT, () => {
  // keep it simple; plug your logger later if you want
  console.log(`Server listening on http://localhost:${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(0);
    }
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));