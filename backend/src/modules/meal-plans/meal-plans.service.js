import { MealPlanError } from "./meal-plans.errors.js";

async function createMealPlanService({ subscriberId, startDate, endDate, planType, items }) {
  const data = validateCreateMealPlanInput({ subscriberId, startDate, endDate, planType, items });
  
}

async function listMealPlansService() {}

async function getMealPlanByIdService() {}

async function updateMealPlanService() {}

async function deleteMealPlanService() {}

export {
  createMealPlanService,
  listMealPlansService,
  getMealPlanByIdService,
  updateMealPlanService,
  deleteMealPlanService,
};
