/**
 * Goals service module
 * Handles business logic for nutrition goals, check-ins, and goal evaluation
 * @module goals/service
 */

import { fetchGoals, findGoalByIdForSubscriber, archiveGoal, archiveGoalsForNutrient, updateGoal, insertGoal, findGuidelinesByDemographic, createManyGoals, findGoalCheckInByDate, createGoalCheckIn, updateGoalCheckIn, upsertGoalCheckIn, listNutrients } from "./goals.repository.js";
import { normalizeSubscriberId, normalizeGoalId, normalizeBooleanQuery, normalizeGoalIncludeQuery, validateUpdateGoalInput, validateCreateGoalInput, GoalError } from "./goals.validator.js";

/**
 * Gets nutrition goals for a subscriber with optional filters
 * @param {Object} params - Service parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {boolean} params.effective - Filter for currently effective goals
 * @param {string} params.include - Include check-ins (none, today, all)
 * @returns {Promise<Array>} Array of nutrition goals
 */
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

/**
 * Updates a nutrition goal for a user
 * @param {Object} params - Service parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {Object} params.goal - Goal data to update
 * @returns {Promise<Object>} The updated goal
 * @throws {GoalError} If goal not found, archived, or unauthorized
 */
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

/**
 * Archives (soft deletes) a nutrition goal for a user
 * @param {Object} params - Service parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {number} params.goalId - The goal ID to archive
 * @returns {Promise<Object>} The archived goal
 * @throws {GoalError} If goal not found, already archived, or unauthorized
 */
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

/**
 * Creates a new user-defined nutrition goal
 * @param {Object} params - Service parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {Object} params.goal - Goal data to create
 * @returns {Promise<Object>} The created goal
 * @throws {GoalError} If validation fails
 */
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

/**
 * Creates a goal for a subscriber with custom options
 * Internal helper function used by createUserGoal and system goal creation
 * @param {Object} params - Service parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {Object} params.goal - Goal data to create
 * @param {Object} [params.options={}] - Creation options (source, status, professional ID)
 * @returns {Promise<Object>} The created goal
 * @throws {GoalError} If validation fails
 */
async function createGoalForSubscriber({ subscriberId, goal, options = {} }) {
    const normalizedSubscriberId = normalizeSubscriberId(subscriberId);
    const validatedGoal = validateCreateGoalInput(goal, options);

    // if this goal tracks a nutrient archive existing active goal for that nutrient first
    if (validatedGoal.nutrientId != null) {
        await archiveGoalsForNutrient({
            subscriberId: normalizedSubscriberId,
            nutrientId: validatedGoal.nutrientId,
        });
    }

    return insertGoal({
        subscriberId: normalizedSubscriberId,
        nutrientId: validatedGoal.nutrientId,
        source: validatedGoal.source,
        status: "active",
        targetMin: validatedGoal.targetMin,
        targetMax: validatedGoal.targetMax,
        setByProfessionalId: validatedGoal.setByProfessionalId,
        startDate: validatedGoal.startDate,
        endDate: validatedGoal.endDate,
        notes: validatedGoal.notes,
    });
}

/**
 * Ensures default nutrition goals are created for a new user based on demographic guidelines
 * @param {Object} params - Service parameters
 * @param {number} params.userId - The user's ID
 * @param {string} [params.demographic="adult"] - User demographic (adult, child, etc.)
 * @param {Object} [params.tx] - Optional Prisma transaction object
 * @returns {Promise<Array>} Array of created default goals
 */
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

/**
 * Converts a date to date-only format (removes time component)
 * @param {Date} [date=new Date()] - The date to convert
 * @returns {Date} Date with time set to midnight
 */
function toDateOnly(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Toggles goal completion status for today
 * Creates or updates a check-in record for the current date
 * @param {Object} params - Service parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {number} params.goalId - The goal ID to toggle
 * @returns {Promise<Object>} The created or updated check-in record
 * @throws {GoalError} If goal not found, archived, not started, or ended
 */
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

/**
 * Lists all available nutrients
 * @returns {Promise<Array>} Array of all nutrients
 */
async function listNutrientsService() {
    return listNutrients();
}

/**
 * Automatically evaluates whether each active nutrient goal is met for today
 * Creates or updates check-in records based on nutrition summary data
 * @param {Object} params - Service parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {Array<Object>} params.nutritionSummary - Array of nutrient totals for today
 * @returns {Promise<void>}
 */
async function evaluateGoalsForToday({ subscriberId, nutritionSummary }) {
    const today = toDateOnly();
    const goals = await fetchGoals({ subscriberId, effective: true });

    // ensures this will only evaluate goals that are linked to a specific nutrient because non nutrient goals are manual
    const nutrientGoals = goals.filter(g => g.nutrientId != null);
    if (!nutrientGoals.length) return;

    // lookup of nutrientid
    const totalsMap = Object.fromEntries(
        nutritionSummary.map(n => [n.nutrientId, Number(n.totalAmount)])
    );

    await Promise.all(nutrientGoals.map(async goal => {
        const total = totalsMap[goal.nutrientId] ?? 0;
        const min = goal.targetMin != null ? Number(goal.targetMin) : null;
        const max = goal.targetMax != null ? Number(goal.targetMax) : null;

        // range goals need both bounds met and single sided goals check one bound
        let isDone = false;
        if (min != null && max != null) isDone = total >= min && total <= max;
        else if (min != null)           isDone = total >= min;
        else if (max != null)           isDone = total <= max;

        // Atomic write avoids race conditions across concurrent evaluations.
        await upsertGoalCheckIn({ goalId: goal.goalId, date: today, isDone });
    }));
}

export { getGoalsService, updateUserGoal, archiveUserGoal, createUserGoal, createGoalForSubscriber, ensureDefaultGoalsForUser, toggleGoalDoneForToday, listNutrientsService, evaluateGoalsForToday };
