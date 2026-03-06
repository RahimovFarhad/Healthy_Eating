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

export { DiaryEntryError, validateCreateDiaryEntryInput, validateSummaryInput };
