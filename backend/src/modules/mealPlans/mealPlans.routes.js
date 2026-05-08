/**
 * Meal plans routes module
 * Defines Express routes for meal planning endpoints
 * @module meal-plans/routes
 */

import { Router } from "express";
import {
    createMealPlan,
    listMealPlans,
    getMealPlanById,
    addPlanItem,
    deleteMealPlan,
    removePlanItem,
} from "./mealPlans.controller.js";

const mealPlansRouter = Router();

// These roues can only be accessed by either client or professional, so we will check the role in the next layers

mealPlansRouter.post("/", createMealPlan); // plantype will be hardcoded to manual for now
mealPlansRouter.get("/", listMealPlans);
mealPlansRouter.get("/:planId", getMealPlanById);
mealPlansRouter.delete("/:planId", deleteMealPlan);

mealPlansRouter.post("/:planId/addItem", addPlanItem);
mealPlansRouter.delete("/:planId/items/:itemId", removePlanItem);

export default mealPlansRouter;
