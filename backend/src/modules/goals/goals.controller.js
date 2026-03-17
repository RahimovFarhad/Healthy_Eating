import { GoalError, normalizeBooleanQuery, normalizeGoalId } from "./goals.validator.js";
import { getGoalsService, updateUserGoal, archiveUserGoal, createUserGoal } from "./goals.service.js";

async function getGoals(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const effective = normalizeBooleanQuery(req.query?.effective, true);
    const goals = await getGoalsService({ subscriberId, effective });

    return res.status(200).json({ goals });
  } catch (error) {
    if (error instanceof GoalError) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
}

async function updateGoal(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const { goals } = req.body;
    const upsertedGoals = await updateUserGoal({ subscriberId, goals });

    return res.status(200).json({ goals: upsertedGoals });
  } catch (error) {
    if (error instanceof GoalError) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
}

async function deleteGoal(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const goalId = normalizeGoalId(req.params?.goalId);
    const deletedGoal = await archiveUserGoal({ subscriberId, goalId });

    return res.status(200).json({ deletedGoal });
  } catch (error) {
    if (error instanceof GoalError) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
}

async function createGoal(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const { goal } = req.body;
    const createdGoal = await createUserGoal({ subscriberId, goal });

    return res.status(201).json({ createdGoal });
  } catch (error) {
    if (error instanceof GoalError) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
}

export { getGoals, updateGoal, deleteGoal, createGoal };
