import { Router } from "express";
import {
  createMealPlan,
  listMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan,
} from "./meal-plans.controller.js";

const mealPlansRouter = Router();

// These roues can only be accessed by either client or professional, so we will check the role in the next layers

mealPlansRouter.post("/", );
mealPlansRouter.get("/", );
mealPlansRouter.get("/:planId", );
mealPlansRouter.patch("/:planId", );
mealPlansRouter.delete("/:planId", );

export default mealPlansRouter;

