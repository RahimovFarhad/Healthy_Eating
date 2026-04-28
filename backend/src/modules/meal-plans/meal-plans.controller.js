async function createMealPlan(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    
  } catch (error) {
    return next(error);
  }
}

async function listMealPlans(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    
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
