const MEAL_TYPES = new Set(["breakfast", "lunch", "dinner", "snack"]);

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

export { DiaryEntryError, validateCreateDiaryEntryInput };
