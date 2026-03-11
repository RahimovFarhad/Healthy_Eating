import { createDiaryEntry, getNutritionSummary, getExistingEntries, getEntryDetails, insertNewEntry, updateExistingEntry, deleteExisitingEntry } from "./diary.service.js";
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

async function listEntries(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null; // req. from user
        // from the diary.service.js file, just show all the entries
        const record = await getExistingEntries({
            subscriberId,
            consumedAt: req.body?.consumedAt,
            mealType: req.body?.mealType,
            notes: req.body?.notes,
        });

        return res.status(200).json({ record });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function getEntryDetail(req, res, next) {
    try {
        const diaryEntryId = req.user?.userId ?? null;
        const entry = await getEntryDetails({
            diaryEntryId,
            type: req.body?.type,
            unit: req.body?.unit,
            quantityG: req.body?.quantityG,
        });

        return res.status(200).json({ entry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);

    }
}

async function addEntryItem(req, res, next) {
    try {
        const diaryEntryId = req.user?.userId ?? null;
        const newItem = await insertNewEntry({
            diaryEntryId,
            subscriberId: req.body?.subscriberId,
            quantityG: req.body?.quantityG,
            consumedAt: req.body?.consumedAt,
            mealType: req.body?.mealType,
            notes: req.body?.notes,
        });

        return res.status(201).json({ newItem });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);

    }
}

async function updateEntryItem(req, res, next) {
    try {
        const diaryEntryId = req.user?.userId ?? null;
        const updatedEntry = await updateExistingEntry({
            diaryEntryId,
            subscriberId: req.body?.subscriberId,
            quantityG: req.body?.quantityG,
            consumedAt: req.body?.consumedAt,
            mealType: req.body?.mealType,
            notes: req.body?.notes,
        });

        return res.status(201).json({ updatedEntry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);

    }
}

async function deleteEntryItem(req, res, next) {
    try {
        const diaryEntryId = req.user?.userId ?? null;
        const deleteEntry = await deleteExisitingEntry({
            diaryEntryId
        });

        return res.status(201).json({ deleteEntry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);

    }
}

export { createEntry, getSummary, listEntries, getEntryDetail, addEntryItem, updateEntryItem, deleteEntryItem };

