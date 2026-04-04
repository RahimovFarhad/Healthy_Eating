import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { prisma } from "./db/prisma.js";
import authRouter from "./modules/auth/auth.routes.js";
import diaryRouter from "./modules/diary/diary.routes.js";
import goalRouter from "./modules/goals/goals.routes.js";
import professionalRouter from "./modules/professional/professional.routes.js";
import clientRouter from "./modules/client/client.routes.js";
import { requireAuth } from "./middleware/requireAuth.js";
import {searchFood, searchFoodById} from "./utils/searchFood.js"

const app = express();
const ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]; // in production, this should be set to the actual frontend URL, and in .env file

function getAllowedOrigins() {
  return ALLOWED_ORIGINS;
}

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    if (!origin) {
      callback(null, true);
      return;
    }

    callback(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,
};

app.use(express.json({ limit: "1mb" }));

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(cookieParser());
app.use("/auth", authRouter);
app.use("/diary", requireAuth, diaryRouter);
app.use("/goals", requireAuth, goalRouter);

app.use("/professional", requireAuth, professionalRouter)
app.use("/client", requireAuth, clientRouter)

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, db: "ok" });
});

app.get("/search", async (req, res) => {
  await searchFood(req.query?.query).then(data => {
    res.json(data);
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

app.get("/search-by-id", async (req, res) => {
  await searchFoodById(req.query?.food_id).then(data => {
    res.json(data);
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// hit myself in every 10 minutes to prevent free-tier render.com from sleeping the server
setInterval(() => {
  fetch(`${process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`}/health`).catch(err => {
    console.error("Health check failed:", err);
  });
}, 10 * 60 * 1000);



app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
