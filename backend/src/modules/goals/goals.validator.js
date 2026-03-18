class GoalError extends Error {
  constructor(message) {
    super(message);
    this.name = "GoalError";
  }
}

const GOAL_SOURCES = new Set(["system_default", "user_defined", "professional_defined"]);
const GOAL_STATUSES = new Set(["active", "archived"]);

function normalizePositiveInteger(value) {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function normalizeNonNegativeNumber(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const parsed = typeof value === "string" ? Number(value) : value;
  if (typeof parsed !== "number" || Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

function normalizeDateOnly(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new GoalError(`${fieldName} must be a valid date`);
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function normalizeSubscriberId(subscriberId) {
  const normalized = normalizePositiveInteger(subscriberId);
  if (!normalized) {
    throw new GoalError("Subscriber ID is required");
  }
  return normalized;
}

function normalizeGoalId(goalId) {
  const normalized = normalizePositiveInteger(goalId);
  if (!normalized) {
    throw new GoalError("Goal ID must be a positive integer");
  }
  return normalized;
}

function normalizeBooleanQuery(value, defaultValue = true) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "true") return true;
    if (lower === "false") return false;
  }

  throw new GoalError("effective must be a boolean");
}

function validateUpdateGoalInput(goal) {
  if (!goal || typeof goal !== "object" || Array.isArray(goal)) {
    throw new GoalError("goal must be a single goal object");
  }

  const goalId = normalizePositiveInteger(goal.goalId);
  if (!goalId) {
    throw new GoalError("goalId is required and must be a positive integer");
  }

  const targetMin = goal.targetMin === undefined ? undefined : normalizeNonNegativeNumber(goal.targetMin);
  const targetMax = goal.targetMax === undefined ? undefined : normalizeNonNegativeNumber(goal.targetMax);

  if (goal.targetMin !== undefined && targetMin === null) {
    throw new GoalError("targetMin must be a non-negative number");
  }

  if (goal.targetMax !== undefined && targetMax === null) {
    throw new GoalError("targetMax must be a non-negative number");
  }

  const currentStatus = goal.status === undefined ? undefined : String(goal.status);
  if (currentStatus !== undefined && !GOAL_STATUSES.has(currentStatus)) {
    throw new GoalError("status must be one of: active, archived");
  }

  const startDate = goal.startDate === undefined ? undefined : normalizeDateOnly(goal.startDate, "startDate");
  const endDate = goal.endDate === undefined ? undefined : normalizeDateOnly(goal.endDate, "endDate");

  if (startDate && endDate && endDate < startDate) {
    throw new GoalError("endDate must be on or after startDate");
  }

  if (targetMin !== undefined && targetMax !== undefined && targetMin !== null && targetMax !== null && targetMin > targetMax) {
    throw new GoalError("targetMin must be less than or equal to targetMax");
  }

  const notes = goal.notes === undefined ? undefined : goal.notes == null ? null : String(goal.notes);
  const source = goal.source === undefined ? undefined : String(goal.source);
  if (source !== undefined && !GOAL_SOURCES.has(source)) {
    throw new GoalError("source must be one of: system_default, user_defined, professional_defined");
  }

  const setByProfessionalId =
    goal.setByProfessionalId === undefined
      ? undefined
      : goal.setByProfessionalId == null
        ? null
        : normalizePositiveInteger(goal.setByProfessionalId);
  if (goal.setByProfessionalId !== undefined && goal.setByProfessionalId !== null && !setByProfessionalId) {
    throw new GoalError("setByProfessionalId must be a positive integer");
  }

  const data = {
    targetMin,
    targetMax,
    status: currentStatus,
    startDate,
    endDate,
    notes,
    source,
    setByProfessionalId,
  };

  const hasAnyField = Object.values(data).some(value => value !== undefined);
  if (!hasAnyField) {
    throw new GoalError("At least one field must be provided to update");
  }

  return {
    goalId,
    data,
  };
}

function validateCreateGoalInput(goal) {
  if (!goal || typeof goal !== "object") {
    throw new GoalError("goal is required");
  }

  const nutrientCode = typeof goal.nutrientCode === "string" ? goal.nutrientCode.trim() : "";
  const nutrientId = normalizePositiveInteger(goal.nutrientId);
  if (!nutrientCode && !nutrientId) {
    throw new GoalError("goal must include nutrientCode or nutrientId");
  }

  const targetMin = normalizeNonNegativeNumber(goal.targetMin);
  const targetMax = normalizeNonNegativeNumber(goal.targetMax);

  if (goal.targetMin !== undefined && targetMin === null) {
    throw new GoalError("targetMin must be a non-negative number");
  }

  if (goal.targetMax !== undefined && targetMax === null) {
    throw new GoalError("targetMax must be a non-negative number");
  }

  if (targetMin === null && targetMax === null) {
    throw new GoalError("At least one of targetMin or targetMax is required");
  }

  if (targetMin !== null && targetMax !== null && targetMin > targetMax) {
    throw new GoalError("targetMin must be less than or equal to targetMax");
  }

  const startDate = normalizeDateOnly(goal.startDate, "startDate") ?? new Date();
  const endDate = normalizeDateOnly(goal.endDate, "endDate");
  if (endDate && endDate < startDate) {
    throw new GoalError("endDate must be on or after startDate");
  }

  const source = "user_defined";

  const status = "active";

  const setByProfessionalId = goal.setByProfessionalId == null
    ? null
    : normalizePositiveInteger(goal.setByProfessionalId);
  if (goal.setByProfessionalId != null && !setByProfessionalId) {
    throw new GoalError("setByProfessionalId must be a positive integer");
  }

  const notes = goal.notes == null ? null : String(goal.notes);

  return {
    nutrientCode,
    nutrientId: nutrientId ?? null,
    targetMin,
    targetMax,
    source,
    status,
    setByProfessionalId,
    startDate,
    endDate,
    notes,
  };
}

export {
  GoalError,
  normalizeSubscriberId,
  normalizeGoalId,
  normalizeBooleanQuery,
  validateUpdateGoalInput,
  validateCreateGoalInput,
};
