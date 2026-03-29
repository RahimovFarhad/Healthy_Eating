const MEAL_TYPES = new Set(["breakfast", "lunch", "dinner", "snack"]);
const SUMMARY_PERIODS = new Set(["daily", "weekly", "monthly"]);
const FOOD_SOURCES = new Set(["fatsecret", "user", "system"]);

// handles any diary errors by raising a notification issue
class DiaryEntryError extends Error {
    constructor(message) {
        super(message);
        this.name = "DiaryEntryError";
    }
}

function normalizePositiveInteger(value) {
    const parsedValue = typeof value === "string" ? Number(value) : value;

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        return null;
    }

    return parsedValue;
}

function normalizePositiveNumber(value) {
    const parsedValue = typeof value === "string" ? Number(value) : value;

    if (typeof parsedValue !== "number" || Number.isNaN(parsedValue) || parsedValue <= 0) {
        return null;
    }

    return parsedValue;
}

function validateCreateDiaryEntryInput({ subscriberId, consumedAt, mealType, notes, items }) {
    const normalizedSubscriberId = normalizePositiveInteger(subscriberId);
    if (!normalizedSubscriberId) {
        throw new DiaryEntryError("Subscriber ID is required");
    }

    const normalizedConsumedAt = new Date(consumedAt);

    if (!consumedAt || Number.isNaN(normalizedConsumedAt.getTime())) {
        throw new DiaryEntryError("Consumed at date is required");
    }

    if (!mealType || !MEAL_TYPES.has(mealType)) {
        throw new DiaryEntryError("Meal type is required and must be one of: breakfast, lunch, dinner, snack");
    }

    // Now validating items
    const normalizedItems = (items ?? []).map((item, index) => {
        const quantity = Number(item.quantity) || 1; // default to 1 if quantity is not provided 
        if (quantity <= 0) {
            throw new DiaryEntryError(`Item at index ${index}: quantity must be a positive number`);
        }

        if (item.portionId == null && item.custom_food == null) {
            throw new DiaryEntryError(`Item at index ${index}: must provide either portionId or custom_food`);
        }

        if (item.portionId != null) {
            const portionId = normalizePositiveInteger(item.portionId);
            if (!portionId) throw new DiaryEntryError(`Item at index ${index}: invalid portionId`);
            return { portionId, quantity };
        }

        // custom_food validation can be expanded later
        return { portionId: null, quantity, customFood: item.custom_food };
    });

    return {
        subscriberId: normalizedSubscriberId,
        consumedAt: normalizedConsumedAt,
        mealType,
        notes,
        items: normalizedItems,
    };
}

function validateSummaryInput({ subscriberId, period, endDate }) {
    const normalizedSubscriberId = normalizePositiveInteger(subscriberId);
    if (!normalizedSubscriberId) {
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
        subscriberId: normalizedSubscriberId,
        period,
        endDate: parsedendDate,
    };
}

function validateListDisplay({ subscriberId, consumedAt, mealType, notes }) {
    const normalizedSubscriberId = normalizePositiveInteger(subscriberId);
    if (!normalizedSubscriberId) {
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
        subscriberId: normalizedSubscriberId, 
        consumedAt: consumedAt ? new Date(consumedAt) : undefined,
        mealType,
        notes
    };
}

function validateEntryDetails({ diaryEntryId }) {
    const normalizedDiaryEntryId = normalizePositiveInteger(diaryEntryId);
    if (!normalizedDiaryEntryId) {
        throw new DiaryEntryError("Diary Entry ID is required");
    }

    return {
        diaryEntryId: normalizedDiaryEntryId
    };
}

function validateNewEntryDetails({ userId, diaryEntryId, quantity, portionId }) {
    const normalizedUserId = normalizePositiveInteger(userId);
    if (!normalizedUserId) {
        throw new DiaryEntryError("User ID is required");
    }

    const normalizedDiaryEntryId = normalizePositiveInteger(diaryEntryId);
    if (!normalizedDiaryEntryId) {
        throw new DiaryEntryError("Diary Entry ID is required");
    }

    const normalizedQuantity = normalizePositiveNumber(quantity);
    if (!normalizedQuantity) {
        throw new DiaryEntryError("Quantity is required and must be a positive number");
    }

    const normalizedPortionId = normalizePositiveInteger(portionId);
    if (!normalizedPortionId) {
        throw new DiaryEntryError("Portion ID is required");
    }

    return {
        diaryEntryId: normalizedDiaryEntryId,
        quantity: normalizedQuantity,
        portionId: normalizedPortionId
    };
}

function validateUpdatedEntryItem({ diaryEntryItemId, userId, portionId, quantity }) {
    const normalizedDiaryEntryItemId = normalizePositiveInteger(diaryEntryItemId);
    if (!normalizedDiaryEntryItemId) {
        throw new DiaryEntryError("Diary Entry ID is required");
    }

    const normalizedUserId = normalizePositiveInteger(userId);
    if (!normalizedUserId) {
        throw new DiaryEntryError("User ID is required");
    }

    const normalizedPortionId = portionId === undefined ? undefined : normalizePositiveInteger(portionId);
    if (portionId !== undefined && !normalizedPortionId) {
        throw new DiaryEntryError("Portion ID is required");
    }

    const normalizedQuantity = quantity === undefined ? undefined : normalizePositiveNumber(quantity);
    if (quantity !== undefined && !normalizedQuantity) {
        throw new DiaryEntryError("Quantity is required and must be a positive number");
    }

    return {
        diaryEntryItemId: normalizedDiaryEntryItemId,
        portionId: normalizedPortionId,
        quantity: normalizedQuantity
    };
}

function validateDeletedDiaryEntry({ userId, diaryEntryId }) {
    const normalizedUserId = normalizePositiveInteger(userId);
    if (!normalizedUserId) {
        throw new DiaryEntryError("User ID is required");
    }

    const normalizedDiaryEntryId = normalizePositiveInteger(diaryEntryId);
    if (!normalizedDiaryEntryId) {
        throw new DiaryEntryError("Diary Entry ID is required");
    }

    return {
        diaryEntryId: normalizedDiaryEntryId
    };
}

function validateDeletedDiaryEntryItem({ userId, diaryEntryId, diaryEntryItemId }) {
    const normalizedUserId = normalizePositiveInteger(userId);
    if (!normalizedUserId) {
        throw new DiaryEntryError("User ID is required");
    }

    const normalizedDiaryEntryItemId = normalizePositiveInteger(diaryEntryItemId);
    if (!normalizedDiaryEntryItemId) {
        throw new DiaryEntryError("Diary Entry Item ID is required");
    }

    return {
        diaryEntryItemId: normalizedDiaryEntryItemId
    };
}

function validateCreateFoodItemInput({ name, brand, source, externalId, createdByUserId }) {
    if (!name || typeof name !== "string" || name.trim() === "") {
        throw new DiaryEntryError("Food item name is required");
    }

    if (!FOOD_SOURCES.has(source)) {
        throw new DiaryEntryError("Source must be one of: fatsecret, user, system");
    }

    if (source === "fatsecret" && !externalId) {
        throw new DiaryEntryError("externalId is required for fatsecret items");
    }

    if (source === "user" && !createdByUserId) {
        throw new DiaryEntryError("createdByUserId is required for user-created items");
    }

    const normalizedCreatedByUserId = createdByUserId ? normalizePositiveInteger(createdByUserId) : null;
    if (createdByUserId && !normalizedCreatedByUserId) {
        throw new DiaryEntryError("createdByUserId must be a positive integer");
    }

    return {
        name: name.trim(),
        brand: brand?.trim() ?? null,
        source,
        externalId: externalId ?? null,
        createdByUserId: normalizedCreatedByUserId,
    };
}

function validateCreateFoodPortionInput({ foodItemId, description, weightG, nutrients }) {
    const normalizedFoodItemId = normalizePositiveInteger(foodItemId);
    if (!normalizedFoodItemId) {
        throw new DiaryEntryError("foodItemId is required and must be a positive integer");
    }

    if (!description || typeof description !== "string" || description.trim() === "") {
        throw new DiaryEntryError("Portion description is required");
    }

    const normalizedWeightG = weightG != null ? Number(weightG) : null;
    if (weightG != null && (isNaN(normalizedWeightG) || normalizedWeightG <= 0)) {
        throw new DiaryEntryError("weightG must be a positive number");
    }

    const normalizedNutrients = (nutrients ?? []).map((n, index) => {
        const nutrientId = normalizePositiveInteger(n.nutrientId);
        if (!nutrientId) throw new DiaryEntryError(`Nutrient at index ${index}: nutrientId must be a positive integer`);

        const amount = Number(n.amount);
        if (isNaN(amount) || amount < 0) throw new DiaryEntryError(`Nutrient at index ${index}: amount must be a non-negative number`);

        return { nutrientId, amount };
    });

    return {
        foodItemId: normalizedFoodItemId,
        description: description.trim(),
        weightG: normalizedWeightG,
        nutrients: normalizedNutrients,
    };
}

function validateUserIdForDashboard({ subscriberId }) {
    const normalizedSubscriberId = normalizePositiveInteger(subscriberId);
    if (!normalizedSubscriberId) {
        throw new DiaryEntryError("Subscriber ID is required");
    }

    return {
        subscriberId: normalizedSubscriberId
     }; 
}

export { DiaryEntryError, validateCreateDiaryEntryInput, validateSummaryInput, validateListDisplay, validateEntryDetails, validateNewEntryDetails, validateUpdatedEntryItem, validateDeletedDiaryEntry, validateDeletedDiaryEntryItem, validateCreateFoodItemInput, validateCreateFoodPortionInput, validateUserIdForDashboard };
