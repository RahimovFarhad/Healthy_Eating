import { createDiaryEntry, getNutritionSummary } from "./diary.service.js";
import { DiaryEntryError } from "./diary.validator.js";

async function createEntry(req, res, next) {
    // console.log("Creating diary entry with body:", req.body);
    try {
        const subscriberId = req.user?.userId ?? null;
        const entry = await createDiaryEntry({
            subscriberId,
            consumedAt: req.body?.consumedAt,
            mealType: req.body?.mealType,
            notes: req.body?.notes,
        });
        res.status(201).json({ entry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
        
    }

}

async function getSummary(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        const summary = await getNutritionSummary({
            subscriberId,
            period: req.query?.period,
            endDate: req.query?.endDate,
        });

        return res.status(200).json({ summary });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

export { createEntry, getSummary };

