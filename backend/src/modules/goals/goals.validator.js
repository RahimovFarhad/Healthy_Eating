class GoalError extends Error {
  constructor(message) {
    super(message);
    this.name = "GoalError";
  }
}

function getGoalErrorStatus(message) {
  if (message.toLowerCase().includes("unauthorized")) {
    return 403; // forbidden access/action
  }
  if (message.toLowerCase().includes("not found")) {
    return 404; // not found
  }
  if (message.toLowerCase().includes("is already archived") ||
    message.toLowerCase().includes("is archived")) {
      return 409; // conflict cases
    }
  
  return 400; // bad request - for otherwise and general error cases
}

const GOAL_SOURCES = new Set(["system_default", "user_defined", "professional_defined"]);
const GOAL_STATUSES = new Set(["active", "archived"]);
const GOAL_INCLUDE_OPTIONS = new Set(["today", "all", "none"]);

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

function normalizeGoalIncludeQuery(value, defaultValue = "none") {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const normalized = String(value).toLowerCase();
  if (!GOAL_INCLUDE_OPTIONS.has(normalized)) {
    throw new GoalError("include must be one of: today, all");
  }

  return normalized;
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

function validateCreateGoalInput(goal, options = {}) {
  if (!goal || typeof goal !== "object") {
    throw new GoalError("goal is required");
  }

  const notes = goal.notes == null ? "" : String(goal.notes).trim();
  if (!notes) {
    throw new GoalError("goal.notes is required");
  }

  const startDate = normalizeDateOnly(goal.startDate, "startDate") ?? new Date();
  const endDate = normalizeDateOnly(goal.endDate, "endDate");
  if (endDate && endDate < startDate) {
    throw new GoalError("endDate must be on or after startDate");
  }

  const nutrientId = goal.nutrientId == null ? null : normalizePositiveInteger(goal.nutrientId);
  if (goal.nutrientId != null && !nutrientId) {
    throw new GoalError("nutrientId must be a positive integer");
  }

  const targetMin = goal.targetMin == null ? null : normalizeNonNegativeNumber(goal.targetMin);
  if (goal.targetMin != null && targetMin === null) {
    throw new GoalError("targetMin must be a non-negative number");
  }

  const targetMax = goal.targetMax == null ? null : normalizeNonNegativeNumber(goal.targetMax);
  if (goal.targetMax != null && targetMax === null) {
    throw new GoalError("targetMax must be a non-negative number");
  }

  if (targetMin != null && targetMax != null && targetMin > targetMax) {
    throw new GoalError("targetMin must be less than or equal to targetMax");
  }

  const forcedSource = options.forcedSource;
  if (forcedSource !== undefined && !GOAL_SOURCES.has(forcedSource)) {
    throw new GoalError("forcedSource must be one of: system_default, user_defined, professional_defined");
  }

  const source = forcedSource ?? (goal.source === undefined ? "user_defined" : String(goal.source));
  if (!GOAL_SOURCES.has(source)) {
    throw new GoalError("source must be one of: system_default, user_defined, professional_defined");
  }

  const forcedStatus = options.forcedStatus;
  if (forcedStatus !== undefined && !GOAL_STATUSES.has(forcedStatus)) {
    throw new GoalError("forcedStatus must be one of: active, archived");
  }

  const forcedSetByProfessionalId = options.forcedSetByProfessionalId;
  const normalizedForcedSetByProfessionalId =
    forcedSetByProfessionalId == null ? null : normalizePositiveInteger(forcedSetByProfessionalId);
  if (forcedSetByProfessionalId != null && !normalizedForcedSetByProfessionalId) {
    throw new GoalError("setByProfessionalId must be a positive integer");
  }
  const setByProfessionalId = normalizedForcedSetByProfessionalId ?? (goal.setByProfessionalId == null
    ? null
    : normalizePositiveInteger(goal.setByProfessionalId));
  if (normalizedForcedSetByProfessionalId == null && goal.setByProfessionalId != null && !setByProfessionalId) {
    throw new GoalError("setByProfessionalId must be a positive integer");
  }
  if (source === "professional_defined" && !setByProfessionalId) {
    throw new GoalError("setByProfessionalId is required for professional_defined goals");
  }

  return {
    nutrientCode: null,
    nutrientId,
    targetMin,
    targetMax,
    source,
    status: "active",
    setByProfessionalId,
    startDate,
    endDate,
    notes,
  };
}

export {
  GoalError,
  getGoalErrorStatus,
  normalizeSubscriberId,
  normalizeGoalId,
  normalizeBooleanQuery,
  normalizeGoalIncludeQuery,
  validateUpdateGoalInput,
  validateCreateGoalInput,
};
