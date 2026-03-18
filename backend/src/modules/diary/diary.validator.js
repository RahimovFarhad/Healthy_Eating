const MEAL_TYPES = new Set(["breakfast", "lunch", "dinner", "snack"]);
const SUMMARY_PERIODS = new Set(["daily", "weekly", "monthly"]);

class DiaryEntryError extends Error {
    constructor(message) {
        super(message);
        this.name = "DiaryEntryError";
    }
}

function validateCreateDiaryEntryInput({ subscriberId, consumedAt, mealType, notes }) {
    if (!subscriberId || !Number.isInteger(subscriberId) || subscriberId <= 0) {
        throw new DiaryEntryError("Subscriber ID is required");
    }

    const normalizedConsumedAt = new Date(consumedAt);

    if (!consumedAt || Number.isNaN(normalizedConsumedAt.getTime())) {
        throw new DiaryEntryError("Consumed at date is required");
    }

    if (!mealType || !MEAL_TYPES.has(mealType)) {
        throw new DiaryEntryError("Meal type is required and must be one of: breakfast, lunch, dinner, snack");
    }

    return {
        subscriberId,
        consumedAt: normalizedConsumedAt,
        mealType,
        notes,
    };
}

function validateSummaryInput({ subscriberId, period, endDate }) {
    if (!subscriberId || !Number.isInteger(subscriberId) || subscriberId <= 0) {
        throw new DiaryEntryError("Subscriber ID is required");
    }

    if (!period || !SUMMARY_PERIODS.has(period)) {
        throw new DiaryEntryError("Period is required and must be one of: daily, weekly, monthly");
    }

    const parsedendDate = new Date(endDate);

    if (!endDate || Number.isNaN(parsedendDate.getTime())) {
        throw new DiaryEntryError("endDate is required and must be a valid date");
    }

    return {
        subscriberId,
        period,
        endDate: parsedendDate,
    };
}

function validateListDisplay({ subscriberId, consumedAt, mealType, notes }) {
    if (!subscriberId || !Number.isInteger(subscriberId) || subscriberId <= 0) {
        throw new DiaryEntryError("Subscriber ID is required");
    }

    if (consumedAt) {
        const parsedConsumedAt = new Date(consumedAt);
        if (Number.isNaN(parsedConsumedAt.getTime())) {
            throw new DiaryEntryError("Consumed at date must be a valid date");
        }
        if (parsedConsumedAt > new Date()) {
            throw new DiaryEntryError("Consumed at date cannot be in the future");
        }
    }

    if (mealType && !MEAL_TYPES.has(mealType)) {
        throw new DiaryEntryError("Meal type must be one of: breakfast, lunch, dinner, snack");
    }

    if (notes && typeof notes !== "string") {
        throw new DiaryEntryError("Notes must be a string");
    }

    return {
        subscriberId, 
        consumedAt: consumedAt ? new Date(consumedAt) : undefined,
        mealType,
        notes
    };
}

function validateEntryDetails({ userId, diaryEntryId }) {
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
        throw new DiaryEntryError("User ID is required");
    }
    
    if (!diaryEntryId || !Number.isInteger(diaryEntryId) || diaryEntryId <= 0) {
        throw new DiaryEntryError("Diary Entry ID is required");
    }

    return {
        userId,
        diaryEntryId
    };
}

function validateNewEntryDetails({ userId, diaryEntryId, quantityG, foodItemId, newFoodName, newQuantityG }) {
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
        throw new DiaryEntryError("User ID is required");
    }

    if (!diaryEntryId || !Number.isInteger(diaryEntryId) || diaryEntryId <= 0) {
        throw new DiaryEntryError("Diary Entry ID is required");
    }

    if (!quantityG || typeof quantityG !== "number" || quantityG <= 0) {
        throw new DiaryEntryError("Quantity in grams is required and must be a positive number");
    }

    // if (!foodItemId || !Number.isInteger(foodItemId) || foodItemId <= 0) {
    //     throw new DiaryEntryError("Food Item ID is required");
    // }

    const hasFoodItemId = foodItemId && Number.isInteger(foodItemId) && foodItemId > 0;

    const isCustom = !hasFoodItemId;

    // check the user entries are valid or not
    if (isCustom) {
        if (!newFoodName || typeof newFoodName !== "string") {
            throw new DiaryEntryError("Custom name is required and must be a string value");
        }
        if (!newQuantityG || typeof newQuantityG !== "number" || newQuantityG <= 0) {
            throw new DiaryEntryError("Quantity in grams is required and must be a positive number");
        }
    }

    return {
        diaryEntryId,
        quantityG,
        foodItemId: hasFoodItemId ? foodItemId: null, // allows custom entries,
        isCustom,
        newFoodName,
        newQuantityG
    };
}

function validateUpdatedEntryItem({ diaryEntryItemId, userId, foodItemId, quantityG }) {
    if (!diaryEntryItemId || !Number.isInteger(diaryEntryItemId) || diaryEntryItemId <= 0) {
        throw new DiaryEntryError("Diary Entry Item ID is required");
    }
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
        throw new DiaryEntryError("User ID is required");
    }
    if (foodItemId && (!Number.isInteger(foodItemId) || foodItemId <= 0)) {
        throw new DiaryEntryError("Food Item ID is required");
    }

    if (quantityG && (typeof quantityG !== "number" || quantityG <= 0)) {
        throw new DiaryEntryError("Quantity in grams is required and must be a positive number");
    }

    return {
        diaryEntryItemId,
        foodItemId,
        quantityG
    };
}

function validateDeletedDiaryEntry({ userId, diaryEntryId }) {
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
        throw new DiaryEntryError("User ID is required");
    }
    if (!diaryEntryId || !Number.isInteger(diaryEntryId) || diaryEntryId <= 0) {
        throw new DiaryEntryError("Diary Entry ID is required");
    }

    return {
        diaryEntryId
    };
}

function validateDeletedDiaryEntryItem({ userId, diaryEntryItemId }) {
    if (!userId || !Number.isInteger(userId) || userId <= 0) {
        throw new DiaryEntryError("User ID is required");
    }
    if (!diaryEntryItemId || !Number.isInteger(diaryEntryItemId) || diaryEntryItemId <= 0) {
        throw new DiaryEntryError("Diary Entry Item ID is required");
    }

    return {
        diaryEntryItemId
    };
}

export { DiaryEntryError, validateCreateDiaryEntryInput, validateSummaryInput, validateListDisplay, validateEntryDetails, validateNewEntryDetails, validateUpdatedEntryItem, validateDeletedDiaryEntry, validateDeletedDiaryEntryItem };
