/**
 * Diary service module
 * Handles business logic for food diary, nutrition tracking, and dashboard data
 * @module diary/service
 */

import { fetchSummaryData, insertDiaryEntry, listDiaryEntries as listDiaryEntriesRepository, findDiaryEntryById, createDiaryEntryItem as createDiaryEntryItemRepository, checkDiaryEntryOwnership, checkDiaryEntryItemOwnership, updateDiaryEntryItem as updateDiaryEntryItemRepository, deleteDiaryEntry, deleteDiaryEntryItem, getDaysLogged, insertFoodItem, insertFoodPortion, fetchWeeklyCalorieTrend, checkExistingFoodItemByExternalId, findRecipePortionForDiary } from "./diary.repository.js";
import { evaluateGoalsForToday } from "../goals/goals.service.js";
import { validateCreateDiaryEntryInput, validateSummaryInput, validateListDisplay, validateNewEntryDetails, validateUpdatedEntryItem, validateDeletedDiaryEntry, validateEntryDetails, validateDeletedDiaryEntryItem, DiaryEntryError, validateUserIdForDashboard, validateCreateFoodItemInput, validateCreateFoodPortionInput, validateCreateRecipeAsDiaryEntryItemInput } from "./diary.validator.js";
import { formatISO } from "date-fns";
import { searchFoodById, parseFoodResponse } from "../../utils/searchFood.js";
import { fetchGoals } from "../goals/goals.repository.js";
import { listRecipes } from "../recipes/recipes.repository.js";

/**
 * Creates a new diary entry with optional food items
 * @param {Object} params - The diary entry parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {Date|string} params.consumedAt - When the meal was consumed
 * @param {string} params.mealType - Type of meal (breakfast, lunch, dinner, snack)
 * @param {string} [params.notes] - Optional notes about the meal
 * @param {Array<Object>} [params.items] - Array of food items to add to the entry
 * @returns {Promise<Object>} The created diary entry with items
 * @throws {DiaryEntryError} If validation fails
 */
async function createDiaryEntry({ subscriberId, consumedAt, mealType, notes, items }) {
    const data = validateCreateDiaryEntryInput({
        subscriberId,
        consumedAt,
        mealType,
        notes,
        items,
    });

    const entry = await insertDiaryEntry(data);

    if (data.items && data.items.length > 0) {
        await Promise.all(data.items.map(item => createDiaryEntryItem({
            userId: subscriberId,
            diaryEntryId: entry.diaryEntryId,
            portionId: item.portionId,
            quantity: item.quantity,
            customFood: item.customFood,
            fatSecret: item.fatSecret
        })));
    }

    const result = await findDiaryEntryById({ diaryEntryId: entry.diaryEntryId, subscriberId: data.subscriberId });
    await triggerGoalEvaluation(data.subscriberId);
    return result;
}

/**
 * Converts various value types to a number
 * Helper function for numeric conversions
 * @param {*} value - Value to convert
 * @returns {number} The numeric value
 */
function toNumber(value) {
    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string") {
        return Number(value);
    }

    if (value && typeof value.toNumber === "function") {
        return value.toNumber();
    }

    return Number(value ?? 0);
}

/**
 * Calculates the date range for a given period ending on endDate
 * Returns rolling date ranges: daily (single day), weekly (Monday-Sunday), monthly (last 30 days)
 * @param {string} period - The period type (daily, weekly, monthly)
 * @param {Date|string} endDate - The end date of the period
 * @returns {Object} Object with fromDate and toDate
 * @throws {Error} If period is unsupported
 */
function getSummaryRange(period, endDate) {
    const toDate = new Date(endDate);
    toDate.setUTCHours(23, 59, 59, 999); // normalize to end of the day in UTC
    let fromDate;

    switch (period) {
    case "daily":
        fromDate = new Date(toDate);
        fromDate.setUTCHours(0, 0, 0, 0);
        break;
    case "weekly":
        fromDate = new Date(toDate);
        fromDate.setUTCHours(0, 0, 0, 0);
        const dayOfWeek = fromDate.getUTCDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // calculate how many days to go back to get to Monday (treat Sunday as 6)
        fromDate.setUTCDate(fromDate.getUTCDate() - daysToMonday);
        toDate.setUTCDate(fromDate.getUTCDate() + 6); // extend to the end of Sunday
        break;
    case "monthly":
        fromDate = new Date(toDate);
        fromDate.setUTCHours(0, 0, 0, 0);
        fromDate.setUTCDate(fromDate.getUTCDate() - 29);
        toDate.setUTCDate(fromDate.getUTCDate() + 29); // extend to the end of the 30-day period
        break;
    default:
        throw new Error(`Unsupported period: ${period}`);
    }

    return { fromDate, toDate };
}

/**
 * Gets aggregated nutrition summary for a user over a specified period
 * Calculates total nutrient amounts from all consumed foods
 * @param {Object} params - The summary parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {string} params.period - The period type (daily, weekly, monthly)
 * @param {Date|string} params.endDate - The end date of the period
 * @returns {Promise<Object>} Object with period, date range, and aggregated nutrients
 * @throws {DiaryEntryError} If validation fails
 */
async function getNutritionSummary({ subscriberId, period, endDate }) {
    const validated = validateSummaryInput({ subscriberId, period, endDate });
    const { fromDate, toDate } = getSummaryRange(validated.period, validated.endDate);
    const foods = await fetchSummaryData({
        subscriberId: validated.subscriberId,
        fromDate,
        toDate,
    });
    // example json: { items: [ { portion: { portionNutrients: [ { nutrient: { name: "Protein" }, amount: 10 } ] }, quantity: 1.5 } ] }

    // Now we need to aggregate the nutrients across all foods and calculate total amounts based on quantity consumed.
    const nutrientMap = new Map();

    for (const entry of foods) {
        for (const item of entry.items) {
            const quantityFactor = toNumber(item.quantity);

            for (const foodNutrient of item.portion.portionNutrients) {
                const n = foodNutrient.nutrient;
                const amount = Number(foodNutrient.amount) * quantityFactor;
                const key = n.nutrientId;

                if (!nutrientMap.has(key)) {
                    nutrientMap.set(key, { ...n, totalAmount: 0 });
                }
                nutrientMap.get(key).totalAmount += amount;
            }
        }
    }

    const nutrients = Array.from(nutrientMap.values())
        .map((n) => ({ ...n, totalAmount: Number(n.totalAmount.toFixed(4)) }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

    return {
        period: validated.period,
        fromDate,
        toDate,
        nutrients: nutrients.map(n => ({ nutrientId: n.nutrientId, name: n.name, code: n.code, unit: n.unit, type: n.type, totalAmount: n.totalAmount })),
    };
}

/**
 * Converts a date value to ISO date string (YYYY-MM-DD format)
 * Helper function for date formatting
 * @param {Date|string} val - The date value to convert
 * @returns {string} ISO date string
 * @throws {Error} If value is not a valid date
 */
const toDateStr = (val) => {
    if (val instanceof Date) {
        return formatISO(val, { representation: "date" });
    }
    if (typeof val === "string") return val.split("T")[0]; // this extracts only date part from an ISO string
    throw new Error(`Invalid date value: ${val}`);
}

/**
 * Gets weekly calorie trend data for a user
 * Returns calories consumed for each day of the week
 * @param {Object} params - The query parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {Date|string} params.endDate - The end date of the week
 * @returns {Promise<Array>} Array of 7 objects with date and calories for each day
 */
async function getWeeklyCaloryTrend({ subscriberId, endDate }) {
    const { fromDate, toDate } = getSummaryRange("weekly", endDate);
    const rows = await fetchWeeklyCalorieTrend({ subscriberId, fromDate, toDate });
    const caloriesByDate = new Map(rows.map(row => [toDateStr(row.date), Number(row.calories)]));

    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(fromDate);
        day.setUTCDate(fromDate.getUTCDate() + i);
        const dateStr = toDateStr(day);
        return { date: dateStr, calories: caloriesByDate.get(dateStr) ?? 0 };
    });

}

/**
 * Lists diary entries with optional filters
 * @param {Object} params - The query parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {string} [params.start] - Start date filter (ISO string)
 * @param {string} [params.end] - End date filter (ISO string)
 * @param {string} [params.mealType] - Meal type filter
 * @param {string} [params.notes] - Notes filter
 * @returns {Promise<Array>} Array of diary entries
 * @throws {DiaryEntryError} If validation fails
 */
async function listDiaryEntries({ subscriberId, start, mealType, notes, end}) {
    const entries = validateListDisplay({ subscriberId, start, end, mealType, notes });

    return listDiaryEntriesRepository(entries); // call function from diary.repository.js file
}

/**
 * Gets a specific diary entry by ID with ownership verification
 * @param {Object} params - The query parameters
 * @param {number} params.diaryEntryId - The diary entry ID
 * @param {number} params.subscriberId - The user's ID
 * @returns {Promise<Object>} The diary entry with items
 * @throws {DiaryEntryError} If unauthorized or validation fails
 */
async function getDiaryEntryById({ diaryEntryId, subscriberId }) {
    const entries = validateEntryDetails({ diaryEntryId, subscriberId }); // validation on data

    const ownershipCheck = await checkDiaryEntryOwnership({ userId: entries.subscriberId, diaryEntryId: entries.diaryEntryId });

    if (!ownershipCheck) {
        throw new DiaryEntryError("Unauthorised access");
    }

    return findDiaryEntryById(entries); // call function from diary.repository.js file
}

/**
 * Creates a new diary entry item (food portion consumed in a meal)
 * Handles custom foods and FatSecret API foods
 * @param {Object} params - The item parameters
 * @param {number} params.userId - The user's ID
 * @param {number} params.diaryEntryId - The diary entry ID
 * @param {number} params.quantity - Quantity consumed
 * @param {number} [params.portionId] - The food portion ID (optional if customFood or fatSecret provided)
 * @param {Object} [params.customFood] - Custom food data (optional)
 * @param {Object} [params.fatSecret] - FatSecret API food data (optional)
 * @returns {Promise<Object>} The created diary entry item
 * @throws {DiaryEntryError} If unauthorized, validation fails, or missing required data
 */
async function createDiaryEntryItem({ userId, diaryEntryId, quantity, portionId, customFood, fatSecret }) {
    let resolvedPortionId = portionId;
    const validatedEntries = validateNewEntryDetails({ userId, diaryEntryId, quantity, portionId: resolvedPortionId, isCustomOrFatSecret: !!customFood || !!fatSecret }); // validation on data

    const ownershipCheck = await checkDiaryEntryOwnership({ userId: validatedEntries.userId, diaryEntryId: validatedEntries.diaryEntryId });

    if (!ownershipCheck) {
        throw new DiaryEntryError("Unauthorised access");
    }

    if (resolvedPortionId == null) {
        if (!customFood && !fatSecret) throw new DiaryEntryError("Must provide either portionId, customFood, or fatSecret");
        // Create the food item + portion first, get back the portionId
        resolvedPortionId = await createCustomFoodAndGetPortionId({ userId, customFood, fatSecret });
        validatedEntries.portionId = resolvedPortionId; // update the validated entries with the new portionId for the next steps
    }

    const entryCheck = await createDiaryEntryItemRepository(validatedEntries);
    await triggerGoalEvaluation(validatedEntries.userId);
    return entryCheck;
}

/**
 * Creates a custom food item and returns its portion ID
 * Handles both user-created custom foods and FatSecret API foods
 * @param {Object} params - The food parameters
 * @param {number} params.userId - The user's ID
 * @param {Object} [params.customFood] - Custom food data with name, brand, and portions
 * @param {Object} [params.fatSecret] - FatSecret API food data with externalId
 * @returns {Promise<number>} The created portion ID
 * @throws {DiaryEntryError} If FatSecret food portion not found
 */
async function createCustomFoodAndGetPortionId({ userId, customFood, fatSecret }) {
    var parsed = null;

    if (fatSecret != null) {
        const response = await searchFoodById(fatSecret.externalId);
        parsed = response?.portions ? response : parseFoodResponse(response);
    }

    const foodItem = await createFoodItem({
        name: fatSecret == null ? customFood.name : parsed.name,
        brand: fatSecret == null ? customFood.brand : parsed.brand,
        source: fatSecret == null  ? "user" : "fatsecret",
        externalId: fatSecret == null  ? null : fatSecret.externalId,
        createdByUserId: fatSecret == null ? userId : null,
    });

    if (fatSecret != null) {
        if (!parsed || !Array.isArray(parsed.portions) || parsed.portions.length === 0) {
            throw new DiaryEntryError("FatSecret food portion not found");
        }
        const portion = parsed.portions[0]; // for simplicity, we just take the first portion returned by the API. In a real implementation, we might want to allow user to select from multiple portions or enter custom portion details.
        const foodPortion = await createFoodPortion({
            foodItemId: foodItem.foodItemId,
            description: portion.description,
            weightG: portion.weight_g ?? null,
            nutrients: portion.nutrients ?? [],
        });

        return foodPortion.portionId;

    }

    const portion = customFood.portions[0];
    const foodPortion = await createFoodPortion({
        foodItemId: foodItem.foodItemId,
        description: portion.description,
        weightG: portion.weight_g ?? null,
        nutrients: portion.nutrients ?? [],
    });

    return foodPortion.portionId;
}

/**
 * Creates a new food item in the database
 * Checks for existing food by external ID to avoid duplicates
 * @param {Object} params - The food item parameters
 * @param {string} params.name - Food item name
 * @param {string} [params.brand] - Brand name
 * @param {string} params.source - Source of the food (user, fatsecret, system)
 * @param {string} [params.externalId] - External ID from source API
 * @param {number} [params.createdByUserId] - User who created this custom food
 * @returns {Promise<Object>} The created or existing food item
 * @throws {DiaryEntryError} If validation fails
 */
async function createFoodItem({ name, brand, source, externalId, createdByUserId }) {
    const data = validateCreateFoodItemInput({ name, brand, source, externalId, createdByUserId });

    if (externalId) {
        const existing = await checkExistingFoodItemByExternalId(externalId);
        if (existing) {
            return existing;
        }
    }

    return insertFoodItem(data);
}

/**
 * Creates a new food portion with nutrient information
 * @param {Object} params - The portion parameters
 * @param {number} params.foodItemId - The food item ID
 * @param {string} params.description - Portion description (e.g., "1 cup", "100g")
 * @param {number} [params.weightG] - Weight in grams
 * @param {Array<Object>} params.nutrients - Array of nutrient objects with nutrientId and amount
 * @returns {Promise<Object>} The created food portion
 * @throws {DiaryEntryError} If validation fails
 */
async function createFoodPortion({ foodItemId, description, weightG, nutrients }) {
    const data = validateCreateFoodPortionInput({ foodItemId, description, weightG, nutrients });

    return insertFoodPortion(data);
}

/**
 * Triggers goal evaluation after diary changes
 * Computes today's nutrition summary and forwards it to goal evaluation
 * @param {number} subscriberId - The user's ID
 * @returns {Promise<void>}
 */
async function triggerGoalEvaluation(subscriberId) {
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);
    const summary = await getNutritionSummary({ subscriberId, period: "daily", endDate: today.toISOString() });
    await evaluateGoalsForToday({ subscriberId, nutritionSummary: summary.nutrients });
}

/**
 * Updates an existing diary entry item with ownership verification
 * @param {Object} params - The update parameters
 * @param {number} params.diaryEntryItemId - The diary entry item ID
 * @param {number} params.userId - The user's ID
 * @param {number} [params.portionId] - New portion ID
 * @param {number} [params.quantity] - New quantity
 * @returns {Promise<Object>} The updated diary entry item
 * @throws {DiaryEntryError} If unauthorized, not found, or validation fails
 */
async function updateDiaryEntryItem({ diaryEntryItemId, userId, portionId, quantity }) {
    const validatedEntries = validateUpdatedEntryItem({ diaryEntryItemId, userId, portionId, quantity });  // validation check

    const ownershipCheck = await checkDiaryEntryItemOwnership({ userId: validatedEntries.userId, diaryEntryItemId: validatedEntries.diaryEntryItemId });

    if (!ownershipCheck) {
        throw new DiaryEntryError("Unauthorised access");
    }

    const entryCheck = await updateDiaryEntryItemRepository(validatedEntries);

    if (!entryCheck) {
        throw new DiaryEntryError("Diary entry item is not found");
    }

    await triggerGoalEvaluation(validatedEntries.userId);
    return entryCheck;
}

/**
 * Deletes a diary entry and all its items with ownership verification
 * @param {Object} params - The delete parameters
 * @param {number} params.userId - The user's ID
 * @param {number} params.diaryEntryId - The diary entry ID to delete
 * @returns {Promise<Object>} The deleted diary entry
 * @throws {DiaryEntryError} If unauthorized, not found, or validation fails
 */
async function deleteExistingDiaryEntry({ userId, diaryEntryId }) {
    const validatedEntries = validateDeletedDiaryEntry({ userId, diaryEntryId }); // validation check

    const ownershipCheck = await checkDiaryEntryOwnership({ userId: validatedEntries.userId, diaryEntryId: validatedEntries.diaryEntryId });

    if (!ownershipCheck) {
        throw new DiaryEntryError("Unauthorised access");
    }

    const entryCheck = await deleteDiaryEntry(validatedEntries);

    if (!entryCheck) {
        throw new DiaryEntryError("Diary entry is not found");
    }

    await triggerGoalEvaluation(validatedEntries.userId);
    return entryCheck;
}

/**
 * Deletes a diary entry item with ownership verification
 * @param {Object} params - The delete parameters
 * @param {number} params.userId - The user's ID
 * @param {number} params.diaryEntryItemId - The diary entry item ID to delete
 * @returns {Promise<Object>} The deleted diary entry item
 * @throws {DiaryEntryError} If unauthorized, not found, or validation fails
 */
async function deleteExistingDiaryEntryItem({ userId, diaryEntryItemId }) {
    const validatedEntries = validateDeletedDiaryEntryItem({ userId, diaryEntryItemId }); // validation check

    const ownershipCheck = await checkDiaryEntryItemOwnership({ userId: validatedEntries.userId, diaryEntryItemId: validatedEntries.diaryEntryItemId });

    if (!ownershipCheck) {
        throw new DiaryEntryError("Unauthorised access");
    }

    const entryCheck = await deleteDiaryEntryItem(validatedEntries);

    if (!entryCheck) {
        throw new DiaryEntryError("Diary entry item is not found");
    }

    await triggerGoalEvaluation(validatedEntries.userId);
    return entryCheck;
}

/**
 * Gets comprehensive dashboard data for a subscriber
 * Aggregates quick stats, food diary preview, calorie trends, nutrition preview, and recommended recipes
 * @param {Object} params - The query parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {string} [params.date] - Optional date for dashboard (defaults to server time)
 * @returns {Promise<Object>} Dashboard data with quickStats, foodDiaryPreview, weeklyCaloryTrend, nutritionPreview, and recommendedRecipes
 * @throws {DiaryEntryError} If validation fails
 */
async function getDashboardDataForSubscriber({ subscriberId, date }) {
    // Needs to implement:
    // 1. Fetch today's meals
    // 2. Fetch today's nutrient summary (can reuse getNutritionSummary with daily period and today's date)
    // 3. Fetch active goals (from goals module) and what percentage of each goal has been achieved based on today's summary and goal targets - this will be implemented only after goals module is ready, so can be left as a placeholder for now
    // 4. Fetch recent messages (from messaging module) - this will be implemented only after messaging module is ready, so can be left as a placeholder for now
    // 5. Fetch recent recipes (from recipe module) - this will also be implemented only after recipe module is ready, so can be left as a placeholder for now

    const entry = validateUserIdForDashboard({ subscriberId, date }); // validation check

    // as we can use previous functions, let's try reuse them as much as possible
    // Use the date provided by client (their local "today"), or fall back to server time
    const today = entry.date ? new Date(entry.date) : new Date();
    const todayStart = new Date(today);
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayEnd = new Date(today);
    todayEnd.setUTCHours(23, 59, 59, 999);

    const summary = await getNutritionSummary({ subscriberId: entry.subscriberId, period: "daily", endDate: today.toISOString() });
    const foodDiaryPreview = await listDiaryEntries({ subscriberId: entry.subscriberId, start: todayStart.toISOString(), end: todayEnd.toISOString() });

    let recommendedRecipes = [];
    try {
        recommendedRecipes = await getRecommendedRecipes({ subscriberId: entry.subscriberId, date: today.toISOString() });
    } catch {
        // Keep dashboard resilient even if recommendation dependencies are unavailable.
        recommendedRecipes = [];
    }
    return {
        quickStats: {
            calories_today: summary.nutrients.find(n => n.code === "calories")?.totalAmount || 0,
            meals_logged_today: foodDiaryPreview.filter(e => e.items?.length > 0).length,
            days_logged: await getDaysLogged({ subscriberId: entry.subscriberId }), // this would require a separate query to count distinct days with entries, can be implemented later
        },
        foodDiaryPreview,
        weeklyCaloryTrend: await getWeeklyCaloryTrend({subscriberId: entry.subscriberId, endDate: todayStart}), // this would require fetching summary for each day of the week, can be implemented later
        nutritionPreview: summary.nutrients.filter(n => ["protein", "carbohydrates", "fat", "fibre"].includes(n.code)),
        savedOrSuggestedRecipesPreview: [], // implement later
        professionalSupportPreview: {}, // implement later
        goalsPreview: {}, // implement later
        recommendedRecipes: recommendedRecipes // implement later
    };

}

/**
 * Creates a diary entry item from a recipe
 * @param {Object} params - The service parameters
 * @param {number} params.userId - The user's ID
 * @param {number} params.diaryEntryId - The diary entry ID
 * @param {number} params.recipeId - The recipe ID
 * @param {number} params.servings - Number of servings consumed
 * @returns {Promise<Object>} The created diary entry item
 * @throws {DiaryEntryError} If recipe portion not found or validation fails
 */
async function createRecipeAsDiaryEntryItemService({ userId, diaryEntryId, recipeId, servings }) {
    const entryCheck = validateCreateRecipeAsDiaryEntryItemInput({ userId, diaryEntryId, recipeId, servings });

    const portion = await findRecipePortionForDiary({ recipeId: entryCheck.recipeId });
    const portionId = portion?.portions?.[0]?.portionId;
    if (!portionId) {
        throw new DiaryEntryError("Recipe portion not found for diary entry item");
    }

    return createDiaryEntryItem({ userId: entryCheck.userId, diaryEntryId: entryCheck.diaryEntryId, portionId, quantity: entryCheck.servings, customFood: null, fatSecret: null });
}

/**
 * Gets recommended recipes based on user's remaining nutritional goals
 * Scores recipes based on how well they fit the user's remaining daily nutrient needs
 * @param {Object} params - The query parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {string} params.date - The date to calculate recommendations for
 * @returns {Promise<Array>} Array of up to 20 recommended recipes sorted by score
 */
async function getRecommendedRecipes({ subscriberId, date }) {
    const goals = await fetchGoals({ subscriberId, effective: true });
    const summary = await getNutritionSummary({ subscriberId, period: "daily", endDate: date });
    const goalsByCode = new Map(goals.filter((g) => g?.nutrient?.code).map((g) => [g.nutrient.code, { min: Number(g.targetMin ?? 0), max: g.targetMax != null ? Number(g.targetMax) : null }]));
    const currentByCode = new Map(summary.nutrients.map((n) => [n.code, Number(n.totalAmount) || 0]));

    const current = (code) => currentByCode.get(code) ?? 0;
    const goal = (code) => goalsByCode.get(code);
    const needed = (code) => Math.max((goal(code)?.min ?? 0) - current(code), 0);
    const remainingMax = (code) => goal(code)?.max != null ? goal(code).max - current(code) : null;

    const remainingCals = Math.max((goal("calories")?.max ?? 2000) - current("calories"), 0);
    const proteinNeeded = needed("protein");
    const carbsNeeded = needed("carbohydrates");
    const fatNeeded = needed("fat");
    const fibreNeeded = needed("fibre");
    const sugarRemaining = remainingMax("sugar");
    const saltRemaining = remainingMax("salt");

    const favorites = await listRecipes({ favoritedBySubscriberId: subscriberId });
    const favoriteCuisines = [...new Set(favorites.map(f => f.cuisine))];
    const favoriteCategories = [...new Set(favorites.map(f => f.category))];

    const allRecipes = await listRecipes({});
    const filteredRecipes = allRecipes.filter(r => r.kcal <= remainingCals + 150);

    const calcExpectedPortion = (nutrientNeeded) => {
        if (nutrientNeeded <= 0 || remainingCals <= 0) return 0;
        const mealsLeft = Math.max(1, Math.ceil(remainingCals / 500));
        return nutrientNeeded / mealsLeft;
    };

    const expectedProtein = calcExpectedPortion(proteinNeeded);
    const expectedCarbs = calcExpectedPortion(carbsNeeded);
    const expectedFat = calcExpectedPortion(fatNeeded);
    const expectedFibre = calcExpectedPortion(fibreNeeded);

    const scoreNutrient = (recipeAmount, expected, weight) => {
        if (expected <= 0) return 0;
        const ratio = Math.min(recipeAmount / expected, 1.1);
        return ratio * weight;
    };

    const scoredRecipes = filteredRecipes.map(r => {
        let score = 0;

        score += scoreNutrient(r.protein || 0, expectedProtein, 4.0);
        score += scoreNutrient(r.carbs || 0, expectedCarbs, 2.5);
        score += scoreNutrient(r.fat || 0, expectedFat, 2.0);
        score += scoreNutrient(r.fibre || 0, expectedFibre, 1.5);

        if (sugarRemaining != null && (r.sugars || 0) > sugarRemaining) score -= 3;
        if (saltRemaining != null && (r.salt || 0) > saltRemaining) score -= 3;

        if (favoriteCuisines.includes(r.cuisine)) score += 1.5;
        if (favoriteCategories.includes(r.category)) score += 1.5;

        return { ...r, score };
    });

    scoredRecipes.sort((a, b) => b.score - a.score);

    return scoredRecipes.slice(0, 20);
}

export { createDiaryEntry, getNutritionSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteExistingDiaryEntry, deleteExistingDiaryEntryItem, getDashboardDataForSubscriber, createRecipeAsDiaryEntryItemService };
