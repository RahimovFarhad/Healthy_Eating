/**
 * Goals controller module
 * Handles HTTP requests for nutrition goal management endpoints
 * @module goals/controller
 */

import { GoalError, normalizeBooleanQuery, normalizeGoalId, normalizeGoalIncludeQuery, validateUpdateGoalInput } from "./goals.validator.js";
import { getGoalsService, updateUserGoal, archiveUserGoal, createUserGoal, toggleGoalDoneForToday, listNutrientsService } from "./goals.service.js";

/**
 * Maps goal error messages to HTTP status codes
 * @param {string} errorMessage - The error message
 * @returns {number} HTTP status code
 */
function getGoalErrorStatus(errorMessage) {
    if (errorMessage === "Goal not found") return 404;
    if (errorMessage === "Unauthorized to archive this goal") return 403;
    if (errorMessage === "Goal is already archived") return 409;
    if (errorMessage === "Goal is archived") return 409;
    if (errorMessage === "Goal has not started yet") return 409;
    if (errorMessage === "Goal end date has passed") return 409;
    return 400;
}

/**
 * Handles getting nutrition goals for a user
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.effective] - Filter for effective goals only
 * @param {string} [req.query.include] - Include check-ins (none, today, all)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with goals or error
 */
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

/**
 * Handles updating a nutrition goal
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} req.body - Request body
 * @param {Object} req.body.goal - Goal data to update
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with updated goal or error
 */
async function updateGoal(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        const goal = req.body?.goal;

        if (!goal) {
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

/**
 * Handles archiving (deleting) a nutrition goal
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.goalId - The goal ID to archive
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with deleted goal or error
 */
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

/**
 * Handles creating a new nutrition goal
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} req.body - Request body
 * @param {Object} req.body.goal - Goal data to create
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with created goal or error
 */
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

/**
 * Handles listing all available nutrients
 * @param {Object} _req - Express request object (unused)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with nutrients list or error
 */
async function listNutrients(_req, res, next) {
    try {
        const nutrients = await listNutrientsService();
        return res.status(200).json({ nutrients });
    } catch (error) {
        return next(error);
    }
}

/**
 * Handles toggling goal completion status for today
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.goalId - The goal ID to toggle
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with check-in data or error
 */
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

export { getGoals, updateGoal, deleteGoal, createGoal, toggleGoalDone, listNutrients };
