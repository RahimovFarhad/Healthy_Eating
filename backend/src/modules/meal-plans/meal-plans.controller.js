/**
 * Meal plans controller module
 * Handles HTTP requests for meal planning endpoints
 * @module meal-plans/controller
 */

import { createMealPlanService, listMealPlansService, getMealPlanByIdService, addPlanItemService, deleteMealPlanService, removePlanItemService } from "./meal-plans.service.js";
import { MealPlanError, getMealErrorStatusCode } from "./meal-plans.validator.js";

async function createMealPlan(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const { startDate, endDate, planType, items } = req.body;
    const mealPlan = await createMealPlanService({
      subscriberId,
      startDate,
      endDate,
      planType: planType ?? "manual",
      items,
    });

    return res.status(201).json(mealPlan);
  } catch (error) {
    const statusCode = getMealErrorStatusCode(error);
    if (error instanceof MealPlanError) {
      return res.status(statusCode).json({ error: error.message });
    }

    return next(error);
  }
}

async function listMealPlans(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const mealPlans = await listMealPlansService({
      subscriberId,
      startDate: req.query?.startDate,
      endDate: req.query?.endDate,
    });

    return res.status(200).json(mealPlans);
  } catch (error) {
    const statusCode = getMealErrorStatusCode(error);
    if (error instanceof MealPlanError) {
      return res.status(statusCode).json({ error: error.message });
    }

    return next(error);
  }
}

async function getMealPlanById(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const planId = parseInt(req.params?.planId, 10);
    const mealPlan = await getMealPlanByIdService({ planId, subscriberId });

    if (!mealPlan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }
    return res.status(200).json(mealPlan);
  } catch (error) {
    const statusCode = getMealErrorStatusCode(error);
    if (error instanceof MealPlanError) {
      return res.status(statusCode).json({ error: error.message });
    }

    return next(error);
  }
}

async function addPlanItem(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const planId = parseInt(req.params?.planId, 10);
    const item = req.body;
    const addedItem = await addPlanItemService({ planId, subscriberId, item });
    
    return res.status(201).json(addedItem);
  } catch (error) {
    const statusCode = getMealErrorStatusCode(error);
    if (error instanceof MealPlanError) {
      return res.status(statusCode).json({ error: error.message });
    }

    return next(error);
  }
}

async function deleteMealPlan(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const planId = parseInt(req.params?.planId, 10);
    const deletedPlan = await deleteMealPlanService({ planId, subscriberId });

    if (deletedPlan.count === 0) {
      return res.status(404).json({ message: "Meal plan not found or you don't have permission to delete it" });
    }
    return res.status(200).json(deletedPlan);
  } catch (error) {
    const statusCode = getMealErrorStatusCode(error);
    if (error instanceof MealPlanError) {
      return res.status(statusCode).json({ error: error.message });
    }
    
    return next(error);
  }
}

async function removePlanItem(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const planId = parseInt(req.params?.planId, 10);
    const planItemId = parseInt(req.params?.itemId, 10);
    const result = await removePlanItemService({ planItemId, planId, subscriberId });

    if (result.count === 0) {
      return res.status(404).json({ message: "Plan item not found or you don't have permission to delete it" });
    }
    return res.status(200).json(result);
  } catch (error) {
    const statusCode = getMealErrorStatusCode(error);
    if (error instanceof MealPlanError) {
      return res.status(statusCode).json({ error: error.message });
    }
    return next(error);
  }
}

export {
  createMealPlan,
  listMealPlans,
  getMealPlanById,
  deleteMealPlan,
  addPlanItem,
  removePlanItem,
};
