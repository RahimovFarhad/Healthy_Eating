import { createDiaryEntry, getNutritionSummary, listDiaryEntries as listDiaryEntriesService, getDiaryEntryById as getDiaryEntryByIdService, createDiaryEntryItem as createDiaryEntryItemService, updateDiaryEntryItem as updateDiaryEntryItemService, deleteExistingDiaryEntry, deleteExistingDiaryEntryItem } from "./diary.service.js";
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
            items: req.body?.items ?? [], // expecting items to be an array of { portionId, quantity }
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

async function listDiaryEntries(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null; // req. from user
        // from the diary.service.js file, just show all the entries
        const record = await listDiaryEntriesService({
            subscriberId,
            consumedAt: req.query?.consumedAt,
            mealType: req.query?.mealType,
            notes: req.query?.notes,
        });

        return res.status(200).json({ record });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function getDiaryEntryById(req, res, next) {
    try {
        const entry = await getDiaryEntryByIdService({
            diaryEntryId: Number(req.params?.id),
        });

        return res.status(200).json({ entry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);

    }
}

async function createDiaryEntryItem(req, res, next) {
    try {
        const userId = req.user?.userId ?? null;
        const newItem = await createDiaryEntryItemService({
            userId,
            diaryEntryId: Number(req.params?.id),
            quantity: req.body?.quantity,
            portionId: req.body?.portionId,
            customFood: req.body?.customFood ?? null,
        });

        return res.status(201).json({ newItem });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);

    }
}

async function updateDiaryEntryItem(req, res, next) {
    try {
        const userId = req.user?.userId ?? null;
        // check if user is trying to update their own diary entry item;
        const updatedEntry = await updateDiaryEntryItemService({
            userId,
            diaryEntryItemId: Number(req.params?.itemId),
            portionId: req.body?.portionId,
            quantity: req.body?.quantity,
        });

        return res.status(200).json({ updatedEntry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);

    }
}

async function deleteEntry(req, res, next) {
    try {
        const userId = req.user?.userId ?? null;
        const deleteEntry = await deleteExistingDiaryEntry({
            userId,
            diaryEntryId: Number(req.params?.id)
        });

        return res.status(200).json({ deleteEntry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);

    }
}

async function deleteEntryItem(req, res, next) {
    try {
        const userId = req.user?.userId ?? null;
        const deleteItem = await deleteExistingDiaryEntryItem({
            userId,
            diaryEntryItemId: Number(req.params?.itemId)
        });

        return res.status(200).json({ deleteItem });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);

    }
}

async function getDashboard(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        // call a service function that aggregates all the necessary data for the dashboard
        const dashboardData = await getDashboardDataForSubscriber(subscriberId);

        return res.status(200).json({ dashboardData });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

export { createEntry, getSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteEntry, deleteEntryItem, getDashboard };
