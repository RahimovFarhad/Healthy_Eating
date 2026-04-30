import { GoalError, normalizeBooleanQuery, normalizeGoalId, normalizeGoalIncludeQuery, validateUpdateGoalInput } from "./goals.validator.js";
import { getGoalsService, updateUserGoal, archiveUserGoal, createUserGoal, toggleGoalDoneForToday } from "./goals.service.js";

function getGoalErrorStatus(errorMessage) {
  if (errorMessage === "Goal not found") return 404;
  if (errorMessage === "Unauthorized to archive this goal") return 403;
  if (errorMessage === "Goal is already archived") return 409;
  if (errorMessage === "Goal is archived") return 409;
  if (errorMessage === "Goal has not started yet") return 409;
  if (errorMessage === "Goal end date has passed") return 409;
  return 400;
}

async function getGoals(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const effective = normalizeBooleanQuery(req.query?.effective, true);
    const include = normalizeGoalIncludeQuery(req.query?.include, "none");
    const goals = await getGoalsService({ subscriberId, effective, include });

    return res.status(200).json({ goals });
  } catch (error) {
    if (error instanceof GoalError) {
      return res.status(getGoalErrorStatus(error.message)).json({ error: error.message });
    }
    return next(error);
  }
}

async function updateGoal(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const goal = req.body?.goal;

    if(!goal) {
      throw new GoalError("goal is required");
    }

    validateUpdateGoalInput(goal);
    const updatedGoal = await updateUserGoal({ subscriberId, goal });

    return res.status(200).json({ updatedGoal});
  } catch (error) {
    if (error instanceof GoalError) {
      return res.status(getGoalErrorStatus(error.message)).json({ error: error.message });
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
      return res.status(getGoalErrorStatus(error.message)).json({ error: error.message });
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
      return res.status(getGoalErrorStatus(error.message)).json({ error: error.message });
    }
    return next(error);
  }
}

async function toggleGoalDone(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const goalId = normalizeGoalId(req.params?.goalId);
    const checkIn = await toggleGoalDoneForToday({ subscriberId, goalId });

    return res.status(200).json({ checkIn });
  } catch (error) {
    if (error instanceof GoalError) {
      return res.status(getGoalErrorStatus(error.message)).json({ error: error.message });
    }
    return next(error);
  }
}

export { getGoals, updateGoal, deleteGoal, createGoal, toggleGoalDone };
