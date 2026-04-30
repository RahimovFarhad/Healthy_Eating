import { createDiaryEntry, getNutritionSummary, listDiaryEntries as listDiaryEntriesService, getDiaryEntryById as getDiaryEntryByIdService, createDiaryEntryItem as createDiaryEntryItemService, updateDiaryEntryItem as updateDiaryEntryItemService, deleteExistingDiaryEntry, deleteExistingDiaryEntryItem, getDashboardDataForSubscriber, createRecipeAsDiaryEntryItemService } from "./diary.service.js";
import { DiaryEntryError, getDiaryErrorStatus } from "./diary.validator.js";

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
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
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
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

async function listDiaryEntries(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        // from the diary.service.js file, just show all the entries
        const record = await listDiaryEntriesService({
            subscriberId,
            start: req.query?.start,
            end: req.query?.end,
            mealType: req.query?.mealType,
            notes: req.query?.notes,
        });

        return res.status(200).json({ record });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

async function getDiaryEntryById(req, res, next) {
    try {
        const entry = await getDiaryEntryByIdService({
            diaryEntryId: Number(req.params?.id),
            userId: req.user?.userId ?? null,
        });

        return res.status(200).json({ entry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
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
            fatSecret: req.body?.fatSecret ?? null,
        });

        return res.status(201).json({ newItem });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);

    }
}

async function updateDiaryEntryItem(req, res, next) {
    try {
        const userId = req.user?.userId ?? null;
        const updatedEntry = await updateDiaryEntryItemService({
            userId,
            diaryEntryItemId: Number(req.params?.itemId),
            portionId: req.body?.portionId,
            quantity: req.body?.quantity,
        });

        return res.status(200).json({ updatedEntry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
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
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
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
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);

    }
}

async function getDashboard(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        // call a service function that aggregates all the necessary data for the dashboard
        const dashboardData = await getDashboardDataForSubscriber({subscriberId});

        return res.status(200).json({ dashboardData });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

async function createEntryWithRecipe(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        const newEntry = await createDiaryEntry({
            subscriberId,
            consumedAt: req.body?.consumedAt,
            mealType: req.body?.mealType,
            notes: req.body?.notes,
            items: [], // start with empty items, will add the recipe item next
        });

        const updatedEntry = await createRecipeAsDiaryEntryItemService({
            userId: subscriberId,
            diaryEntryId: newEntry.diaryEntryId,
            recipeId: Number(req.params?.recipeId),
            servings: req.body?.servings,
        });

        return res.status(201).json({ entry: updatedEntry });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

async function createRecipeAsDiaryEntryItem(req, res, next) {
    try {
        const subscriberId = req.user?.userId ?? null;
        const newItem = await createRecipeAsDiaryEntryItemService({
            userId: subscriberId,
            diaryEntryId: Number(req.params?.id),
            recipeId: Number(req.params?.recipeId),
            servings: req.body?.servings,
        });

        return res.status(201).json({ newItem });
    } catch (error) {
        if (error instanceof DiaryEntryError) {
            return res.status(getDiaryErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}
export { createEntry, getSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteEntry, deleteEntryItem, getDashboard, createEntryWithRecipe, createRecipeAsDiaryEntryItem };
