import express from "express";
import cookieParser from "cookie-parser";
import { prisma } from "./db/prisma.js";
import authRouter from "./modules/auth/auth.routes.js";
// import diaryRouter from "./modules/diary/diary.routes.js";
// import goalRouter from "./modules/goals/goals.routes.js";
// import professionalRouter from "./modules/professional/professional.routes.js";
// import clientRouter from "./modules/client/client.routes.js";
// import { requireAuth } from "./middleware/requireAuth.js";
// import {searchFood, searchFoodById} from "./utils/searchFood.js"

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/auth", authRouter);
// app.use("/diary", requireAuth, diaryRouter);
// app.use("/goals", requireAuth, goalRouter);

// app.use("/professional", requireAuth, professionalRouter)
// app.use("/client", requireAuth, clientRouter)

app.get("/health", async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, db: "ok" });
});

// app.get("/search", async (req, res) => {
//   await searchFood(req.query?.query).then(data => {
//     res.json(data);
//   }).catch(err => {
//     res.status(500).json({ error: err.message });
//   });
// });

// app.get("/search-by-id", async (req, res) => {
//   await searchFoodById(req.query?.food_id).then(data => {
//     res.json(data);
//   }).catch(err => {
//     res.status(500).json({ error: err.message });
//   });
// });



app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
