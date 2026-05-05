import { fetchSummaryData, insertDiaryEntry, listDiaryEntries as listDiaryEntriesRepository, findDiaryEntryById, createDiaryEntryItem as createDiaryEntryItemRepository, checkDiaryEntryOwnership, checkDiaryEntryItemOwnership, updateDiaryEntryItem as updateDiaryEntryItemRepository, deleteDiaryEntry, deleteDiaryEntryItem, getDaysLogged, insertFoodItem, insertFoodPortion, fetchWeeklyCalorieTrend, checkExistingFoodItemByExternalId, findRecipePortionForDiary } from "./diary.repository.js";
import { evaluateGoalsForToday } from "../goals/goals.service.js";
import { validateCreateDiaryEntryInput, validateSummaryInput, validateListDisplay, validateNewEntryDetails, validateUpdatedEntryItem, validateDeletedDiaryEntry, validateEntryDetails, validateDeletedDiaryEntryItem, DiaryEntryError, validateUserIdForDashboard, validateCreateFoodItemInput, validateCreateFoodPortionInput, validateCreateRecipeAsDiaryEntryItemInput } from "./diary.validator.js";
import { formatISO } from "date-fns";
import {searchFoodById, parseFoodResponse} from "../../utils/searchFood.js"

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

// Returns a rolling date range for the given period ending on endDate.
// weekly = last 7 days, monthly = last 30 days.
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

const toDateStr = (val) => {
    if (val instanceof Date) {
        return formatISO(val, { representation: "date" });
    }
    if (typeof val === "string") return val.split("T")[0]; // this extracts only date part from an ISO string
    throw new Error(`Invalid date value: ${val}`);
}

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

// only subscriberId is required, other filters are optional
async function listDiaryEntries({ subscriberId, start, mealType, notes, end}) { 
    const entries = validateListDisplay({ subscriberId, start, end, mealType, notes });

    return listDiaryEntriesRepository(entries); // call function from diary.repository.js file
}

async function getDiaryEntryById({ diaryEntryId, subscriberId }) {
    const entries = validateEntryDetails({ diaryEntryId, subscriberId }); // validation on data

    return findDiaryEntryById(entries); // call function from diary.repository.js file
}

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

async function createCustomFoodAndGetPortionId({ userId, customFood, fatSecret }) {
    var parsed = null;
    
    if (fatSecret != null) {
        const foodDetails = await searchFoodById(fatSecret.externalId);
        parsed = parseFoodResponse(foodDetails);
    }
    
    const foodItem = await createFoodItem({
        name: fatSecret == null ? customFood.name : parsed.name,
        brand: fatSecret == null ? customFood.brand : parsed.brand,
        source: fatSecret == null  ? "user" : "fatsecret",
        externalId: fatSecret == null  ? null : fatSecret.externalId,
        createdByUserId: fatSecret == null ? userId : null,
    });

    if (fatSecret != null) {
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

async function createFoodItem({ name, brand, source, externalId, createdByUserId }) {
    const data = validateCreateFoodItemInput({ name, brand, source, externalId, createdByUserId });

    if (externalId){
        const existing = await checkExistingFoodItemByExternalId(externalId);
        if (existing) {
            return existing;
        }
    }

    return insertFoodItem(data);
}

async function createFoodPortion({ foodItemId, description, weightG, nutrients }) {
    const data = validateCreateFoodPortionInput({ foodItemId, description, weightG, nutrients });

    return insertFoodPortion(data);
}

// this function will compute todays nutrition summary and forwards it to goal evaluation.
// this will call after any diary edit so goal check-ins are always up to date.
async function triggerGoalEvaluation(subscriberId) {
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);
    const summary = await getNutritionSummary({ subscriberId, period: "daily", endDate: today.toISOString() });
    await evaluateGoalsForToday({ subscriberId, nutritionSummary: summary.nutrients });
}

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
        recommendedRecipes: [] // implement later
    };


}

async function createRecipeAsDiaryEntryItemService({ userId, diaryEntryId, recipeId, servings }) {
    const entryCheck = validateCreateRecipeAsDiaryEntryItemInput({ userId, diaryEntryId, recipeId, servings }); 

    const portion = await findRecipePortionForDiary({ recipeId: entryCheck.recipeId });
    const portionId = portion?.portions?.[0]?.portionId; 
    if (!portionId) {
        throw new DiaryEntryError("Recipe portion not found for diary entry item");
    }

    return createDiaryEntryItem({ userId: entryCheck.userId, diaryEntryId: entryCheck.diaryEntryId, portionId, quantity: entryCheck.servings, customFood: null, fatSecret: null });
}

export { createDiaryEntry, getNutritionSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteExistingDiaryEntry, deleteExistingDiaryEntryItem, getDashboardDataForSubscriber, createRecipeAsDiaryEntryItemService };
