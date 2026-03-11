import { fetchSummaryData, insertDiaryEntry, listDiaryEntry, retrieveEntries, newDiaryEntry, updateDiaryEntry, deleteDiaryEntry } from "./diary.repository.js";
import { validateCreateDiaryEntryInput, validateSummaryInput, validateListDisplay, validateNewEntryDetails, validateUpdatedEntry, validateDeletedEntry } from "./diary.validator.js";

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

async function getExistingEntries({ subscriberId }) {
    const entries = validateListDisplay({ subscriberId });

    return listDiaryEntry(entries); // call function from diary.repository.js file
}

async function getEntryDetails({ diaryEntryId }) {
    const entries = validateEntryDetails({ diaryEntryId }); // validation on data

    return retrieveEntries(entries); // call function from diary.repository.js file
}

async function insertNewEntry({ diaryEntryId }) {
    const entry = validateNewEntryDetails({ diaryEntryId });

    return newDiaryEntry(entry);
}

async function updateExistingEntry({ diaryEntryId }) {
    const entry = validateUpdatedEntry({ diaryEntryId });  // validation check

    return updateDiaryEntry(entry);
}

async function deleteExisitingEntry({ diaryEntryId }) {
    const entry = validateDeletedEntry({ diaryEntryId }); // validation check

    return deleteDiaryEntry(entry);
}

export { createDiaryEntry, getNutritionSummary, getExistingEntries, getEntryDetails, insertNewEntry, updateExistingEntry, deleteExisitingEntry };
