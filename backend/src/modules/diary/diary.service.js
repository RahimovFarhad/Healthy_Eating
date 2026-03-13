import { fetchSummaryData, insertDiaryEntry, listDiaryEntries as listDiaryEntriesRepository, findDiaryEntryById, createDiaryEntryItem as createDiaryEntryItemRepository, updateDiaryEntryItem as updateDiaryEntryItemRepository, deleteDiaryEntry, deleteDiaryEntryItem } from "./diary.repository.js";
import { validateCreateDiaryEntryInput, validateSummaryInput, validateListDisplay, validateNewEntryDetails, validateUpdatedEntryItem, validateDeletedDiaryEntry, validateEntryDetails, validateDeletedDiaryEntryItem, DiaryEntryError } from "./diary.validator.js";

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

// Returns a date range for the given period and end date. The end date is exclusive.
function getSummaryRange(period, endDate) {
    const toDate = new Date(endDate);
    toDate.setUTCHours(0, 0, 0, 0);
    let fromDate;

    switch (period) {
        case "daily":
            fromDate = new Date(toDate);
            fromDate.setUTCDate(fromDate.getUTCDate() - 1);
            break;
        case "weekly": // current week's Monday until endDate
            fromDate = new Date(toDate);
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
        nutrients: nutrients.map(n => ({ name: n.name, unit: n.unit, type: n.type, totalAmount: n.totalAmount })),
    };
}

// only subscriberId is required, other filters are optional
async function listDiaryEntries({ subscriberId, consumedAt, mealType, notes }) { 
    const entries = validateListDisplay({ subscriberId, consumedAt, mealType, notes });

    return listDiaryEntriesRepository(entries); // call function from diary.repository.js file
}

async function getDiaryEntryById({ diaryEntryId }) {
    const entries = validateEntryDetails({ diaryEntryId }); // validation on data

    return findDiaryEntryById(entries); // call function from diary.repository.js file
}

async function createDiaryEntryItem({ userId, diaryEntryId, quantity, portionId, customFood }) {
    let resolvedPortionId = portionId;

    if (resolvedPortionId == null) {
        if (!customFood) throw new DiaryEntryError("Must provide either portionId or customFood");
        // Create the food item + portion first, get back the portionId
        resolvedPortionId = await createCustomFoodAndGetPortionId({ userId, customFood });
    }

    const entry = validateNewEntryDetails({ userId, diaryEntryId, quantity, portionId }); // validation on data

    return createDiaryEntryItemRepository(entry);
}

async function createCustomFoodAndGetPortionId({ userId, customFood }) {
    const foodItem = await prisma.foodItem.create({
        data: {
            name: customFood.name,
            brand: customFood.brand ?? null,
            source: "user",
            createdByUserId: userId,
        },
    });

    // Take the first portion for now (can be extended later)
    const portion = customFood.portions[0];
    const foodPortion = await prisma.foodPortion.create({
        data: {
            foodItemId: foodItem.foodItemId,
            description: portion.description,
            weightG: portion.weight_g ?? null,
            portionNutrients: {
                create: portion.nutrients.map(n => ({
                    nutrientId: n.nutrientId,
                    amount: n.amount,
                })),
            },
        },
    });

    return foodPortion.portionId;
}

async function updateDiaryEntryItem({ diaryEntryItemId, userId, portionId, quantity }) {
    const entry = validateUpdatedEntryItem({ diaryEntryItemId, userId, portionId, quantity });  // validation check

    return updateDiaryEntryItemRepository(entry);
}

async function deleteExistingDiaryEntry({ userId, diaryEntryId }) {
    const entry = validateDeletedDiaryEntry({ userId, diaryEntryId }); // validation check

    return deleteDiaryEntry(entry);
}

async function deleteExistingDiaryEntryItem({ userId, diaryEntryItemId }) {
    const entry = validateDeletedDiaryEntryItem({ userId, diaryEntryItemId }); // validation check

    return deleteDiaryEntryItem({ diaryEntryItemId: entry.diaryEntryItemId });
}

async function getDashboard({ subscriberId }) {
    // Needs to implement:
    // 1. Fetch today's meals 
    // 2. Fetch today's nutrient summary (can reuse getNutritionSummary with daily period and today's date)
    // 3. Fetch active goals (from goals module) and what percentage of each goal has been achieved based on today's summary and goal targets - this will be implemented only after goals module is ready, so can be left as a placeholder for now
    // 4. Fetch recent messages (from messaging module) - this will be implemented only after messaging module is ready, so can be left as a placeholder for now
    // 5. Fetch recent recipes (from recipe module) - this will also be implemented only after recipe module is ready, so can be left as a placeholder for now

    const entry = validateUserIdForDashboard({ subscriberId }); // validation check

    // as we can use previous functions, let's try reuse them as much as possible
    const today = new Date();
    const summary = await getNutritionSummary({ subscriberId, period: "daily", endDate: today.toISOString() });
    const foodDiaryPreview = await listDiaryEntries({ subscriberId, consumedAt: today.toISOString() });

    const currentDayOfWeek = today.getUTCDay(); // 0 (Sun) - 6 (Sat)
    const daysSinceMonday = (currentDayOfWeek + 6) % 7; // Convert to 0 (Mon) - 6 (Sun)
    const startOfWeek = new Date(today);
    startOfWeek.setUTCDate(today.getUTCDate() - daysSinceMonday);
    const weeklyEntries = await listDiaryEntries({ subscriberId, consumedAt: startOfWeek.toISOString() });
    // we can calculate weekly calory trend based on daily summaries for each day of the week, but for simplicity let's just return total calories for the week for now
    
        

    

    return {
        quickStats: {
            calories_today: summary.nutrients.find(n => n.type === "CAL_KCAL")?.totalAmount || 0,
            meals_logged_today: foodDiaryPreview.length,
            days_logged: await getDaysLogged({ subscriberId }), // this would require a separate query to count distinct days with entries, can be implemented later
        },
        foodDiaryPreview,
        weeklyCaloryTrend: [], // this would require fetching summary for each day of the week, can be implemented later
        nutritionPreview: summary.nutrients.filter(n => ["protein", "carbohydrates", "fat"].includes(n.type)),
        savedOrSuggestedRecipesPreview: [], // implement later
        professionalSupportPreview: {}, // implement later
        goalsPreview: {}, // implement later
        recommendedRecipes: [] // implement later
    };


}

export { createDiaryEntry, getNutritionSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteExistingDiaryEntry, deleteExistingDiaryEntryItem };
