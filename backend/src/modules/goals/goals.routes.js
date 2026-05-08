/**
 * Goals routes module
 * Defines Express routes for nutrition goal management endpoints
 * @module goals/routes
 */

import { Router } from "express";
import { createGoal, deleteGoal, getGoals, updateGoal, toggleGoalDone, listNutrients } from "./goals.controller.js";

/**
 * Express router for goals endpoints
 * @type {Router}
 */
const goalsRouter = Router();

/**
 * GET /nutrients - List all available nutrients
 */
goalsRouter.get("/nutrients", listNutrients);

/**
 * GET / - Get nutrition goals for user
 */
goalsRouter.get("/", getGoals);

/**
 * PATCH / - Update a nutrition goal
 */
goalsRouter.patch("/", updateGoal);

/**
 * POST / - Create a new nutrition goal
 */
goalsRouter.post("/", createGoal);

/**
 * DELETE /:goalId - Archive (delete) a nutrition goal
 */
goalsRouter.delete("/:goalId", deleteGoal);

/**
 * PATCH /:goalId/toggle-done - Toggle goal completion for today
 */
goalsRouter.patch("/:goalId/toggle-done", toggleGoalDone)

export default goalsRouter;
