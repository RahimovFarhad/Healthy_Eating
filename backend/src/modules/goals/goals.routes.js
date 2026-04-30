import { Router } from "express";
import { createGoal, deleteGoal, getGoals, updateGoal, toggleGoalDone } from "./goals.controller.js";

const goalsRouter = Router();

// Whether or not system generated goals are completed should be done by system automatically

goalsRouter.get("/", getGoals);
goalsRouter.patch("/", updateGoal);
goalsRouter.post("/", createGoal);
goalsRouter.delete("/:goalId", deleteGoal);

goalsRouter.patch("/:goalId/toggle-done", toggleGoalDone) //toggle goal done

export default goalsRouter;
