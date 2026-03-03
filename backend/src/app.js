import express from "express";
import { prisma } from "./db/prisma.ts";
import authRouter from "./modules/auth/auth.routes.js";
import diaryRouter from "./modules/diary/diary.routes.js";
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use("/auth", authRouter);
app.use("/diary", requireAuth, diaryRouter);

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, db: "ok" });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
