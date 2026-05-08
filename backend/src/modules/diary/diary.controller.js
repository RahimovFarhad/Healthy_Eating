/**
 * Diary controller module
 * Handles HTTP requests for food diary and nutrition tracking endpoints
 * @module diary/controller
 */

import { createDiaryEntry, getNutritionSummary, listDiaryEntries as listDiaryEntriesService, getDiaryEntryById as getDiaryEntryByIdService, createDiaryEntryItem as createDiaryEntryItemService, updateDiaryEntryItem as updateDiaryEntryItemService, deleteExistingDiaryEntry, deleteExistingDiaryEntryItem, getDashboardDataForSubscriber, createRecipeAsDiaryEntryItemService } from "./diary.service.js";
import { DiaryEntryError, getDiaryErrorStatus } from "./diary.validator.js";

/**
 * Handles creating a new diary entry with optional food items
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} req.body - Request body
 * @param {Date|string} req.body.consumedAt - When the meal was consumed
 * @param {string} req.body.mealType - Type of meal
 * @param {string} [req.body.notes] - Optional notes
 * @param {Array<Object>} [req.body.items] - Array of food items
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with created entry or error
 */
async function createEntry(req, res, next) {
    // console.log("Creating diary entry with body:", req.body);
    try {
        const subscriberId = req.user?.userId ?? null;
        const entry = await createDiaryEntry({
            subscriberId,
            consumedAt: req.body?.consumedAt,
            mealType: req.body?.mealType,
            notes: req.body?.notes,
            items: req.body?.items ?? [], // expecting items to be an array of { portionId, quantity }
        });
        res.status(201).json({ entry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
        
    }

}

/**
 * Handles getting nutrition summary for a user
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.period - Period type (daily, weekly, monthly)
 * @param {string} req.query.endDate - End date of the period
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with nutrition summary or error
 */
async function getSummary(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        const summary = await getNutritionSummary({
            subscriberId,
            period: req.query?.period,
            endDate: req.query?.endDate,
        });

        return res.status(200).json({ summary });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

/**
 * Handles listing diary entries with optional filters
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.start] - Start date filter
 * @param {string} [req.query.end] - End date filter
 * @param {string} [req.query.mealType] - Meal type filter
 * @param {string} [req.query.notes] - Notes filter
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with diary entries or error
 */
async function listDiaryEntries(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        // from the diary.service.js file, just show all the entries
        const record = await listDiaryEntriesService({
            subscriberId,
            start: req.query?.start,
            end: req.query?.end,
            mealType: req.query?.mealType,
            notes: req.query?.notes,
        });

        return res.status(200).json({ record });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

/**
 * Handles getting a specific diary entry by ID
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - The diary entry ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with diary entry or error
 */
async function getDiaryEntryById(req, res, next) {
    try {
        const entry = await getDiaryEntryByIdService({
            diaryEntryId: Number(req.params?.id),
            subscriberId: req.user?.userId ?? null,
        });

        return res.status(200).json({ entry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);

    }
}

/**
 * Handles creating a new diary entry item (adding food to a meal)
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - The diary entry ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} req.body - Request body
 * @param {number} req.body.quantity - Quantity consumed
 * @param {number} [req.body.portionId] - Food portion ID
 * @param {Object} [req.body.customFood] - Custom food data
 * @param {Object} [req.body.fatSecret] - FatSecret API food data
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with created item or error
 */
async function createDiaryEntryItem(req, res, next) {
    try {
        const userId = req.user?.userId ?? null;
        const newItem = await createDiaryEntryItemService({
            userId,
            diaryEntryId: Number(req.params?.id),
            quantity: req.body?.quantity,
            portionId: req.body?.portionId,
            customFood: req.body?.customFood ?? null,
            fatSecret: req.body?.fatSecret ?? null,
        });

        return res.status(201).json({ newItem });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);

    }
}

/**
 * Handles updating an existing diary entry item
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.itemId - The diary entry item ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} req.body - Request body
 * @param {number} [req.body.portionId] - New portion ID
 * @param {number} [req.body.quantity] - New quantity
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with updated item or error
 */
async function updateDiaryEntryItem(req, res, next) {
    try {
        const userId = req.user?.userId ?? null;
        const updatedEntry = await updateDiaryEntryItemService({
            userId,
            diaryEntryItemId: Number(req.params?.itemId),
            portionId: req.body?.portionId,
            quantity: req.body?.quantity,
        });

        return res.status(200).json({ updatedEntry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);

    }
}

/**
 * Handles deleting a diary entry
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - The diary entry ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with deleted entry or error
 */
async function deleteEntry(req, res, next) {
    try {
        const userId = req.user?.userId ?? null;
        const deleteEntry = await deleteExistingDiaryEntry({
            userId,
            diaryEntryId: Number(req.params?.id)
        });

        return res.status(200).json({ deleteEntry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);

    }
}

/**
 * Handles deleting a diary entry item
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.itemId - The diary entry item ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with deleted item or error
 */
async function deleteEntryItem(req, res, next) {
    try {
        const userId = req.user?.userId ?? null;
        const deleteItem = await deleteExistingDiaryEntryItem({
            userId,
            diaryEntryItemId: Number(req.params?.itemId)
        });

        return res.status(200).json({ deleteItem });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);

    }
}

/**
 * Handles getting comprehensive dashboard data for a user
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} req.query - Query parameters
 * @param {string} [req.query.date] - Optional date for dashboard
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with dashboard data or error
 */
async function getDashboard(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        // call a service function that aggregates all the necessary data for the dashboard
        const dashboardData = await getDashboardDataForSubscriber({
            subscriberId,
            date: req.query?.date // optional: client can send their local date so there will be no timezone issue will be
        });

        return res.status(200).json({ dashboardData });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

/**
 * Handles creating a new diary entry with a recipe
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.recipeId - The recipe ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} req.body - Request body
 * @param {Date|string} req.body.consumedAt - When the meal was consumed
 * @param {string} req.body.mealType - Type of meal
 * @param {string} [req.body.notes] - Optional notes
 * @param {number} req.body.servings - Number of servings
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with created entry or error
 */
async function createEntryWithRecipe(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        const newEntry = await createDiaryEntry({
            subscriberId,
            consumedAt: req.body?.consumedAt,
            mealType: req.body?.mealType,
            notes: req.body?.notes,
            items: [], // start with empty items, will add the recipe item next
        });

        const updatedEntry = await createRecipeAsDiaryEntryItemService({
            userId: subscriberId,
            diaryEntryId: newEntry.diaryEntryId,
            recipeId: Number(req.params?.recipeId),
            servings: req.body?.servings,
        });

        return res.status(201).json({ entry: updatedEntry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

/**
 * Handles adding a recipe as a diary entry item to an existing entry
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - The diary entry ID
 * @param {string} req.params.recipeId - The recipe ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The user's ID
 * @param {Object} req.body - Request body
 * @param {number} req.body.servings - Number of servings
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with created item or error
 */
async function createRecipeAsDiaryEntryItem(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        const newItem = await createRecipeAsDiaryEntryItemService({
            userId: subscriberId,
            diaryEntryId: Number(req.params?.id),
            recipeId: Number(req.params?.recipeId),
            servings: req.body?.servings,
        });

        return res.status(201).json({ newItem });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}
export { createEntry, getSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteEntry, deleteEntryItem, getDashboard, createEntryWithRecipe, createRecipeAsDiaryEntryItem };