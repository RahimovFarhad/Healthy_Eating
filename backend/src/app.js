import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "./db/prisma.js";
import authRouter from "./modules/auth/auth.routes.js";
import diaryRouter from "./modules/diary/diary.routes.js";
import goalRouter from "./modules/goals/goals.routes.js";
import professionalRouter from "./modules/professional/professional.routes.js";
import clientRouter from "./modules/client/client.routes.js";
import recipesRouter from "./modules/recipes/recipes.routes.js";
import { requireAuth } from "./middleware/requireAuth.js";
import {searchFood, searchFoodById} from "./utils/searchFood.js"
import { rateLimit } from "express-rate-limit";

import mealPlansRouter from "./modules/meal-plans/meal-plans.routes.js";

const app = express();

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many auth attempts, please try again later." },
});

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "test") {
  app.use(globalLimiter);
  app.use("/api/auth", authLimiter, authRouter);
} else {
  app.use("/api/auth", authRouter);
}
app.use("/api/diary", requireAuth, diaryRouter);
app.use("/api/goals", requireAuth, goalRouter);
app.use("/api/professional", requireAuth, professionalRouter);
app.use("/api/client", requireAuth, clientRouter);
app.use("/api/recipes", recipesRouter);
app.use("/api/meal-plans", requireAuth, mealPlansRouter);

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, db: "ok" });
});

app.get("/api/search", requireAuth, async (req, res) => {
  await searchFood(req.query?.query).then(data => {
    res.json(data);
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

app.get("/api/search-by-id", requireAuth, async (req, res) => {
  await searchFoodById(req.query?.food_id).then(data => {
    res.json(data);
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
