import { Router } from "express";
import { createGoal, deleteGoal, getGoals, updateGoal } from "./goals.controller.js";

const goalsRouter = Router();

goalsRouter.get("/", getGoals);
goalsRouter.patch("/", updateGoal);
goalsRouter.post("/", createGoal);
goalsRouter.delete("/:goalId", deleteGoal);

export default goalsRouter;
