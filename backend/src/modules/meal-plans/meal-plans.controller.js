import {createMealPlanService} from "./meal-plans.service.js";

async function createMealPlan(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const { startDate, endDate, planType, items } = req.body;
    const mealPlan = await createMealPlanService({
      subscriberId,
      startDate,
      endDate,
      planType: "manual",
      items,
    });
    return res.status(201).json(mealPlan);
  } catch (error) {
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
    return next(error);
  }
}

async function getMealPlanById(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const planId = req.params?.planId;
    
  } catch (error) {
    return next(error);
  }
}

async function updateMealPlan(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const planId = req.params?.planId;
   
  } catch (error) {
    return next(error);
  }
}

async function deleteMealPlan(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const planId = req.params?.planId;
    
  } catch (error) {
    return next(error);
  }
}

export {
  createMealPlan,
  listMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan,
};
