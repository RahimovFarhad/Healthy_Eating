import { Router } from "express";
import { createGoal, deleteGoal, getGoals, updateGoal } from "./goals.controller.js";

const goalsRouter = Router();

// Whether or not system generated goals are completed should be done by system automatically

goalsRouter.get("/", getGoals);
goalsRouter.patch("/", updateGoal);
goalsRouter.post("/", createGoal);
goalsRouter.delete("/:goalId", deleteGoal);

// goalsRouter.delete("/goals/:goalId/delete") // will archive the goal
// goalsRouter.patch("/goals/:goalId/done") //set goal done for today

export default goalsRouter;
