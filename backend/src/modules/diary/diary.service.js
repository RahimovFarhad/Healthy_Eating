import { insertDiaryEntry } from "./diary.repository.js";
import { validateCreateDiaryEntryInput } from "./diary.validator.js";

async function createDiaryEntry({ subscriberId, consumedAt, mealType, notes }) {
    const data = validateCreateDiaryEntryInput({
        subscriberId,
        consumedAt,
        mealType,
        notes,
    });

    return insertDiaryEntry(data);
}

export { createDiaryEntry };
