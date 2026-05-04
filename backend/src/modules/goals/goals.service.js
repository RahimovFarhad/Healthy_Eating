import { fetchGoals, findGoalByIdForSubscriber, archiveGoal, updateGoal, insertGoal, findGuidelinesByDemographic, createManyGoals, findGoalCheckInByDate, createGoalCheckIn, updateGoalCheckIn } from "./goals.repository.js";
import { normalizeSubscriberId, normalizeGoalId, normalizeBooleanQuery, normalizeGoalIncludeQuery, validateUpdateGoalInput, validateCreateGoalInput, GoalError } from "./goals.validator.js";

async function getGoalsService({ subscriberId, effective, include }) {
  const normalizedSubscriberId = normalizeSubscriberId(subscriberId);
  const normalizedEffective = normalizeBooleanQuery(effective, true);
  const normalizedInclude = normalizeGoalIncludeQuery(include, "none");
  return fetchGoals({
    subscriberId: normalizedSubscriberId,
    effective: normalizedEffective,
    include: normalizedInclude,
  });
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
  if (existingGoal.status === "archived") {
    throw new GoalError("Goal is archived");
  }
  if (existingGoal.subscriber.userId != subscriberId) {
    throw new GoalError("Unauthorized to archive this goal");
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
  if (existingGoal.subscriber.userId != subscriberId) {
    throw new GoalError("Unauthorized to archive this goal");
  }

  return archiveGoal({ goalId: normalizedGoalId, archivedAt: new Date() });
}

async function createUserGoal({ subscriberId, goal }) {
  return createGoalForSubscriber({
    subscriberId,
    goal,
    options: {
      forcedSource: "user_defined",
      forcedStatus: "active",
      forcedSetByProfessionalId: null,
    },
  });
}

async function createGoalForSubscriber({ subscriberId, goal, options = {} }) {
  const normalizedSubscriberId = normalizeSubscriberId(subscriberId);
  const validatedGoal = validateCreateGoalInput(goal, options);

  return insertGoal({
    subscriberId: normalizedSubscriberId,
    nutrientId: null,
    source: validatedGoal.source,
    status: "active",
    targetMin: null,
    targetMax: null,
    setByProfessionalId: validatedGoal.setByProfessionalId,
    startDate: validatedGoal.startDate,
    endDate: validatedGoal.endDate,
    notes: validatedGoal.notes,
  });
}

async function ensureDefaultGoalsForUser({ userId, demographic = "adult", tx }) {
  const guidelines = await findGuidelinesByDemographic(demographic, tx);
  if (!guidelines.length) return;

  const today = new Date();
  const rows = guidelines.map((guideline) => ({
    subscriberId: userId,
    nutrientId: guideline.nutrientId,
    source: "system_default",
    status: "active",
    targetMin: guideline.minValue,
    targetMax: guideline.maxValue,
    startDate: today,
  }));

  return createManyGoals(rows, tx);
}

function toDateOnly(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

async function toggleGoalDoneForToday({ subscriberId, goalId }) {
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
    throw new GoalError("Goal is archived");
  }

  const today = toDateOnly();
  if (existingGoal.startDate && today < toDateOnly(existingGoal.startDate)) {
    throw new GoalError("Goal has not started yet");
  }
  if (existingGoal.endDate && toDateOnly(existingGoal.endDate) < today) {
    throw new GoalError("Goal end date has passed");
  }

  const existingCheckIn = await findGoalCheckInByDate({
    goalId: normalizedGoalId,
    date: today,
  });

  if (!existingCheckIn) {
    return createGoalCheckIn({
      goalId: normalizedGoalId,
      date: today,
      isDone: true,
    });
  }

  return updateGoalCheckIn({
    checkInId: existingCheckIn.checkInId,
    isDone: !existingCheckIn.isDone,
  });
}

export { getGoalsService, updateUserGoal, archiveUserGoal, createUserGoal, createGoalForSubscriber, ensureDefaultGoalsForUser, toggleGoalDoneForToday };
