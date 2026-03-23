import { fetchSummaryData, insertDiaryEntry, listDiaryEntries as listDiaryEntriesRepository, findDiaryEntryById, createDiaryEntryItem as createDiaryEntryItemRepository, updateDiaryEntryItem as updateDiaryEntryItemRepository, deleteDiaryEntry, deleteDiaryEntryItem, getDaysLogged, insertFoodItem, insertFoodPortion, fetchWeeklyCalorieTrend } from "./diary.repository.js";
import { validateCreateDiaryEntryInput, validateSummaryInput, validateListDisplay, validateNewEntryDetails, validateUpdatedEntryItem, validateDeletedDiaryEntry, validateEntryDetails, validateDeletedDiaryEntryItem, DiaryEntryError, validateUserIdForDashboard, validateCreateFoodItemInput, validateCreateFoodPortionInput } from "./diary.validator.js";
import { formatISO } from "date-fns";
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
            customFood: item.customFood
        })));
    }

    return findDiaryEntryById({ diaryEntryId: entry.diaryEntryId }); // return the full entry with items after creation

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

// Returns a date range for the given period and end date. It sets end date to the end of the day, and start date to the beginning of the day (for daily), or the beginning of Monday of the current week (for weekly), or the first day of the month (for monthly).
function getSummaryRange(period, endDate) {
    const toDate = new Date(endDate);
    toDate.setUTCHours(23, 59, 59, 999); // normalize to end of the day in UTC
    let fromDate;

    switch (period) {
        case "daily":
            fromDate = new Date(toDate);
            fromDate.setUTCHours(0, 0, 0, 0);
            break;
        case "weekly": // current week's Monday until endDate
            fromDate = new Date(endDate);
            fromDate.setUTCHours(0, 0, 0, 0);
            const dayOfWeek = toDate.getUTCDay(); // 0 (Sun) - 6 (Sat)
            const daysSinceMonday = (dayOfWeek + 6) % 7; // Convert to 0 (Mon) - 6 (Sun)
            fromDate.setUTCDate(fromDate.getUTCDate() - daysSinceMonday);
            break;
        case "monthly":
            fromDate = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), 1));
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
        nutrients: nutrients.map(n => ({ name: n.name, code: n.code, unit: n.unit, type: n.type, totalAmount: n.totalAmount })),
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
async function listDiaryEntries({ subscriberId, consumedAt, mealType, notes }) { 
    const entries = validateListDisplay({ subscriberId, consumedAt, mealType, notes });

    return listDiaryEntriesRepository(entries); // call function from diary.repository.js file
}

async function getDiaryEntryById({ userId, diaryEntryId }) {
    const validatedData = validateEntryDetails({ userId, diaryEntryId }); // validation on data

    const entryById = await findDiaryEntryById(validatedData); // get data from user

    // authentication checks
    if (!entryById) {
        throw new DiaryEntryError("Entry not found.");
    }
    if (entryById.subscriber.userId !== userId) {
        throw new DiaryEntryError("Unauthorised access.");
    }

    return entryById;
}

async function createDiaryEntryItem({ userId, diaryEntryId, quantity, portionId, customFood }) {
    let resolvedPortionId = portionId;

    if (resolvedPortionId == null) {
        if (!customFood) throw new DiaryEntryError("Must provide either portionId or customFood");
        // Create the food item + portion first, get back the portionId
        resolvedPortionId = await createCustomFoodAndGetPortionId({ userId, customFood });
    }

    const entry = validateNewEntryDetails({ userId, diaryEntryId, quantity, portionId: resolvedPortionId }); // validation on data

    // first check whether user is in their diary 
    const entryById = await findDiaryEntryById(validatedEntries.diaryEntryId); // retrieve diary entry

    if (!entryById) {
        throw new DiaryEntryError("Diary entry not found.");
    }
    if (entryById.subscriber.userId !== userId) {
        throw new DiaryEntryError("Unauthorised access.");
    }

    // then, check if entry item is custom or not
    let newItemEntryId = validatedEntries.foodItemId;

    if (validatedEntries.isCustom) {
        const newCustomItem = await createDiaryEntryItemRepository({
            newFoodName: validatedEntries.newFoodName,
            newQuantityG: validatedEntries.newQuantityG
        });

        newItemEntryId = newCustomItem.id; // assign an ID to the new entry
    }

    const entries = await createDiaryEntryItemRepository(validatedEntries); // create diary entry item

    return entries;
}

async function createCustomFoodAndGetPortionId({ userId, customFood }) {
    const foodItem = await createFoodItem({
        name: customFood.name,
        brand: customFood.brand ?? null,
        source: "user",
        externalId: null,
        createdByUserId: userId,
    });

    // First portion is used as the diary item's portion — multi-portion support can come later
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

    return insertFoodItem(data);
}

async function createFoodPortion({ foodItemId, description, weightG, nutrients }) {
    const data = validateCreateFoodPortionInput({ foodItemId, description, weightG, nutrients });

    return insertFoodPortion(data);
}

async function updateDiaryEntryItem({ diaryEntryItemId, userId, portionId, quantity }) {
    const entry = validateUpdatedEntryItem({ diaryEntryItemId, userId, portionId, quantity });  // validation check

    // check to see if item is retrieved or not
    const entryItem = await findDiaryEntryItemById(validatedEntries.diaryEntryItemId); // retrieve diary entry item

    if (!entryItem) {
        throw new DiaryEntryError("Item in diary not found.");
    }
    
    // once item is checked, check whether the user is authorised to access diary entry or not
    const diaryEntry = await findDiaryEntryById({diaryEntryId: entryItem.diaryEntryId})

    if (!diaryEntry) {
        throw new DiaryEntryError("Diary entry not found.");
    }
    if (diaryEntry.subscriber.userId !== userId) {
        throw new DiaryEntryError("Unauthorised access.");
    }

    // after the authentication checks, user can now update their diary entry with new items
    const entries = await updateDiaryEntryItemRepository(validatedEntries);

    return entries;
}

async function deleteExistingDiaryEntry({ userId, diaryEntryId }) {
    const validatedEntries = validateDeletedDiaryEntry({ userId, diaryEntryId }); // validation check on data

    // first check whether user is in their diary first
    const diaryId = await findDiaryEntryById(validatedEntries.diaryEntryId); // retrieve diary by ID

    if (!diaryId) {
        throw new DiaryEntryError("Diary entry not found.");
    }
    if (diaryId.subscriber.userId !== userId) {
        throw new DiaryEntryError("Unauthorised access.");
    }

    // once the check is done, the diary entry can now be deleted

    return deleteDiaryEntry(validatedEntries);
}

async function deleteExistingDiaryEntryItem({ userId, diaryEntryItemId }) {
    const entry = validateDeletedDiaryEntryItem({ userId, diaryEntryItemId }); // validation check

    return deleteDiaryEntryItem({ diaryEntryItemId: entry.diaryEntryItemId });
}

async function getDashboardDataForSubscriber({ subscriberId }) {
    // Needs to implement:
    // 1. Fetch today's meals 
    // 2. Fetch today's nutrient summary (can reuse getNutritionSummary with daily period and today's date)
    // 3. Fetch active goals (from goals module) and what percentage of each goal has been achieved based on today's summary and goal targets - this will be implemented only after goals module is ready, so can be left as a placeholder for now
    // 4. Fetch recent messages (from messaging module) - this will be implemented only after messaging module is ready, so can be left as a placeholder for now
    // 5. Fetch recent recipes (from recipe module) - this will also be implemented only after recipe module is ready, so can be left as a placeholder for now

    const entry = validateUserIdForDashboard({ subscriberId }); // validation check

    // as we can use previous functions, let's try reuse them as much as possible
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const summary = await getNutritionSummary({ subscriberId: entry.subscriberId, period: "daily", endDate: todayStart.toISOString() });
    const foodDiaryPreview = await listDiaryEntries({ subscriberId: entry.subscriberId, consumedAt: todayStart.toISOString() });

    
    // we can calculate weekly calory trend based on daily summaries for each day of the week, but for simplicity let's just return total calories for the week for now
    
        
    return {
        quickStats: {
            calories_today: summary.nutrients.find(n => n.code === "calories")?.totalAmount || 0,
            meals_logged_today: foodDiaryPreview.length,
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

export { createDiaryEntry, getNutritionSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteExistingDiaryEntry, deleteExistingDiaryEntryItem, getDashboardDataForSubscriber };
