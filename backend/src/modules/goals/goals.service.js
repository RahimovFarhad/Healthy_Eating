import { fetchGoals, findNutrientById, findNutrientByCode, findGoalByIdForSubscriber, archiveGoal, updateGoal, insertGoal } from "./goals.repository.js";
import { normalizeSubscriberId, normalizeGoalId, normalizeBooleanQuery, validateUpdateGoalInput, validateCreateGoalInput, GoalError } from "./goals.validator.js";

async function getGoalsService({ subscriberId, effective }) {
  const normalizedSubscriberId = normalizeSubscriberId(subscriberId);
  const normalizedEffective = normalizeBooleanQuery(effective, true);
  return fetchGoals({ subscriberId: normalizedSubscriberId, effective: normalizedEffective });
}

async function updateUserGoal({ subscriberId, goal }) {
  const normalizedSubscriberId = normalizeSubscriberId(subscriberId);
  const validatedUpdate = validateUpdateGoalInput(goal);

  const existingGoal = await findGoalByIdForSubscriber({
    subscriberId: normalizedSubscriberId,
    goalId: validatedUpdate.goalId,
  });

  if (!existingGoal) {
    throw new GoalError("Goal not found");
  }

  return updateGoal({
    goalId: validatedUpdate.goalId,
    data: validatedUpdate.data,
  });
}

async function archiveUserGoal({ subscriberId, goalId }) {
  const normalizedSubscriberId = normalizeSubscriberId(subscriberId);
  const normalizedGoalId = normalizeGoalId(goalId);

  const existingGoal = await findGoalByIdForSubscriber({
    subscriberId: normalizedSubscriberId,
    goalId: normalizedGoalId,
  });

  if (!existingGoal) {
    throw new GoalError("Goal not found");
  }
  if (existingGoal.status === "archived") {
    throw new GoalError("Goal is already archived");
  }
  if (existingGoal.subscriber.userId != subscriberId){
    throw new GoalError("Unauthorized to archive this goal");
  }

  return archiveGoal({ goalId: normalizedGoalId, archivedAt: new Date() });
}

async function createUserGoal({ subscriberId, goal }) {
  const normalizedSubscriberId = normalizeSubscriberId(subscriberId);
  const validatedGoal = validateCreateGoalInput(goal);

  const nutrient = validatedGoal.nutrientId
    ? await findNutrientById({ nutrientId: validatedGoal.nutrientId })
    : await findNutrientByCode({ nutrientCode: validatedGoal.nutrientCode });

  if (!nutrient) {
    throw new GoalError("Nutrient not found");
  }

  return insertGoal({
    subscriberId: normalizedSubscriberId,
    nutrientId: nutrient.nutrientId,
    source: validatedGoal.source,
    status: validatedGoal.status,
    targetMin: validatedGoal.targetMin,
    targetMax: validatedGoal.targetMax,
    setByProfessionalId: validatedGoal.setByProfessionalId,
    startDate: validatedGoal.startDate,
    endDate: validatedGoal.endDate,
    notes: validatedGoal.notes,
  });
}


export { getGoalsService, updateUserGoal, archiveUserGoal, createUserGoal };
