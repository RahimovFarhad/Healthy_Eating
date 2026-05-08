/**
 * Meal plans service module
 * Handles business logic for meal planning and plan items
 * @module meal-plans/service
 */

import { MealPlanError, validateCreateMealPlanInput, validateListMealPlansInput, validateGetMealPlanByIdInput, validatePlanItem, validateRemovePlanItemInput } from "./mealPlans.validator.js";
import { createMealPlan, listMealPlans, getMealPlanById, deleteMealPlan, addPlanItem, removePlanItem } from "./mealPlans.repository.js";

async function createMealPlanService({ subscriberId, startDate, endDate, planType, items }) {
    const data = validateCreateMealPlanInput({ subscriberId, startDate, endDate, planType, items });
    return createMealPlan(data);

}

async function listMealPlansService({ subscriberId, startDate, endDate }) {
    const data = validateListMealPlansInput({ subscriberId, startDate, endDate });
    return listMealPlans(data);
}

async function getMealPlanByIdService({ planId, subscriberId }) {
    const data = validateGetMealPlanByIdInput({ planId, subscriberId });
    return getMealPlanById(data); // no need to security check here; On the repo layer, only return if both subscriberid and planid
}

async function addPlanItemService({ planId, subscriberId, item }) {
    const data = validateGetMealPlanByIdInput({ planId, subscriberId }); // no need to do separate validation, because they have the exact same input
    const validatedItem = validatePlanItem(item);
    const mealPlan = await getMealPlanById(data);

    if (!mealPlan) {
        throw new MealPlanError("Meal plan not found or you don't have permission to add items to it");
    }
    if (mealPlan.startDate > validatedItem.plannedDate || mealPlan.endDate < validatedItem.plannedDate) {
        throw new MealPlanError("Planned date of the item must be within the start and end date of the meal plan");
    }

    return addPlanItem({ planId, item: validatedItem });

}

async function deleteMealPlanService({ planId, subscriberId }) {
    const data = validateGetMealPlanByIdInput({ planId, subscriberId }); // no need to do separate validation, because they have the exact same input
    const deletedPlan = await deleteMealPlan(data);

    return deletedPlan;

}

async function removePlanItemService({ planItemId, planId, subscriberId }) {
    const data = validateRemovePlanItemInput({ planItemId, planId, subscriberId });
    return removePlanItem(data);
}

export {
    createMealPlanService,
    listMealPlansService,
    getMealPlanByIdService,
    addPlanItemService,
    deleteMealPlanService,
    removePlanItemService,
};
