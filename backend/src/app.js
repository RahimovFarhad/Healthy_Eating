import express from "express";
import cors from "cors";
import helmet from "helmet";
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

import mealPlansRouter from "./modules/mealPlans/mealPlans.routes.js";

const app = express();
app.set('trust proxy', 1);

// Security headers with helmet - configured to not break existing functionality
// Safe for both HTTP (development) and HTTPS (production)
app.use(helmet({
  contentSecurityPolicy: false,  // Disable CSP (can be configured later, but our backend is a JSON API, so does not matter)
  crossOriginEmbedderPolicy: false,  // Allow embedding resources
  hsts: false,  // Disable HSTS - currently we use website on localhost, so no https enforced; Enable it on production with secure cookies and https
}));

// CORS configuration - allows both same-origin and cross-origin requests
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:5174',  // Alternative Vite port
  'http://localhost:4173',  // Vite preview
];

if (process.env.FRONTEND_URL) { // Later in production, we can set FRONTEND_URL to the actual frontend domain to allow CORS from there
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) { // Allow if origin in list
      return callback(null, true);
    }
    
    callback(new Error("Not allowed by CORS"), false); // block unknown origins
  },
  credentials: true,  // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
