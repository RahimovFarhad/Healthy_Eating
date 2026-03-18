import { fetchSummaryData, insertDiaryEntry, listDiaryEntries as listDiaryEntriesRepository, findDiaryEntryById, findDiaryEntryItemById, createDiaryEntryItem as createDiaryEntryItemRepository, updateDiaryEntryItem as updateDiaryEntryItemRepository, deleteDiaryEntry, deleteDiaryEntryItem } from "./diary.repository.js";
import { validateCreateDiaryEntryInput, validateSummaryInput, validateListDisplay, validateNewEntryDetails, validateUpdatedEntryItem, validateDeletedDiaryEntry, validateEntryDetails, validateDeletedDiaryEntryItem, DiaryEntryError } from "./diary.validator.js";

async function createDiaryEntry({ subscriberId, consumedAt, mealType, notes }) {
    const data = validateCreateDiaryEntryInput({
        subscriberId,
        consumedAt,
        mealType,
        notes,
    });

    return insertDiaryEntry(data);
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

function roundTo4(value) {
    return Number(value.toFixed(4));
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
    // example json: { items: [ { foodItem: { foodNutrients: [ { nutrient: { name: "Protein" }, amountPer100g: 10 } ] }, quantityG: 150 } ] }

    // Now we need to aggregate the nutrients across all foods and calculate total amounts based on quantity consumed.
    const nutrientMap = new Map();

    for (const entry of foods) {
        for (const item of entry.items) {
            const quantityFactor = toNumber(item.quantityG) / 100;

            for (const foodNutrient of item.foodItem.foodNutrients) {
                const n = foodNutrient.nutrient;
                const amount = Number(foodNutrient.amountPer100g) * quantityFactor;
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

async function createDiaryEntryItem({ userId, diaryEntryId, quantityG, foodItemId, newFoodName, newQuantityG }) {
    const validatedEntries = validateNewEntryDetails({ userId, diaryEntryId, quantityG, foodItemId, newFoodName, newQuantityG }); // validation on data

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

async function updateDiaryEntryItem({ diaryEntryItemId, userId, foodItemId, quantityG }) {
    const validatedEntries = validateUpdatedEntryItem({ diaryEntryItemId, userId, foodItemId, quantityG });  // validation on the data

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
    const validatedEntries = validateDeletedDiaryEntryItem({ userId, diaryEntryItemId }); // validation check

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

    // after the authentication checks, user can now delete a diary entry item
    const entries = await deleteDiaryEntryItem(validatedEntries);

    return deleteDiaryEntryItem(entries);
}

export { createDiaryEntry, getNutritionSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteExistingDiaryEntry, deleteExistingDiaryEntryItem };
