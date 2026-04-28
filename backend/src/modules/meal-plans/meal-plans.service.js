import { MealPlanError, validateCreateMealPlanInput, validateListMealPlansInput } from "./meal-plans.validator.js";
import { createMealPlan, listMealPlans } from "./meal-plans.repository.js";

async function createMealPlanService({ subscriberId, startDate, endDate, planType, items }) {
  const data = validateCreateMealPlanInput({ subscriberId, startDate, endDate, planType, items });
  return createMealPlan(data);

}

async function listMealPlansService() {
  const data = validateListMealPlansInput({ subscriberId, startDate, endDate });
  return listMealPlans(data);
}

async function getMealPlanByIdService() {}

async function updateMealPlanService() { // for now, only adding new items, no updating or deleting existing items

} 

async function deleteMealPlanService() {}

export {
  createMealPlanService,
  listMealPlansService,
  getMealPlanByIdService,
  updateMealPlanService,
  deleteMealPlanService,
};
