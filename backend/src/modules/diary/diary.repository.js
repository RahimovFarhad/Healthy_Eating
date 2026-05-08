/**
 * Diary repository module
 * Handles database operations for food diary entries and nutrition tracking
 * @module diary/repository
 */

import { prisma } from "../../db/prisma.js";
 
/**
 * Inserts a new diary entry into the database
 * @param {Object} params - The diary entry parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {Date|string} params.consumedAt - When the meal was consumed
 * @param {string} params.mealType - Type of meal (breakfast, lunch, dinner, snack)
 * @param {string} [params.notes] - Optional notes about the meal
 * @returns {Promise<Object>} The created diary entry
 */
async function insertDiaryEntry({ subscriberId, consumedAt, mealType, notes }) {
    return prisma.diaryEntry.create({
        data: {
            subscriberId,
            consumedAt,
            mealType,
            notes,
        },
    });
}

/**
 * Fetches diary entries with nutrition data for calculating summary statistics
 * @param {Object} params - The query parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {Date} params.fromDate - Start date of the range
 * @param {Date} params.toDate - End date of the range
 * @returns {Promise<Array>} Array of diary entries with portion nutrients
 */
async function fetchSummaryData({ subscriberId, fromDate, toDate }) {
    const foods = await prisma.diaryEntry.findMany({
        where: {
            subscriberId,
            consumedAt: {
                gte: fromDate,
                lt: toDate,
            },
        },
        select: {
                items: {
                    select: {
                        quantity: true,
                        portion: {
                            select: {
                                portionNutrients: {
                                    select: {
                                        nutrient: true,
                                        amount: true,
                                    },
                            },
                        },
                    },
                },
            },
        }
    });

    // example json: { items: [ { portion: { portionNutrients: [ { nutrient: { name: "Protein" }, amount: 10 } ] }, quantity: 1.5 } ] }

    return foods; 
    
}

/**
 * Lists diary entries with optional filters
 * @param {Object} params - The query parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {string} [params.start] - Start date filter (ISO string)
 * @param {string} [params.end] - End date filter (ISO string)
 * @param {string} [params.mealType] - Meal type filter
 * @param {string} [params.notes] - Notes filter
 * @returns {Promise<Array>} Array of diary entries with items and nutrition details
 */
async function listDiaryEntries({ subscriberId, start, end, mealType, notes }) {
    // add more filters 
    const entries = await prisma.diaryEntry.findMany({
        where: { 
            subscriberId,
            mealType: mealType ? { equals: mealType } : undefined,
            notes: notes ? { equals: notes } : undefined,
            consumedAt: (start || end) ? {
                ...(start && {gte: new Date(start)}),
                ...(end && {lte: new Date(end)})
            } : undefined,

        },  
        // attributes shown to client when requested
        select: { 
            diaryEntryId: true,
            consumedAt: true,
            mealType: true,
            notes: true,
            items: {
                select: {
                    id: true,
                    portionId: true,
                    quantity: true,
                    portion: {
                        select: {
                            description: true,
                            weightG: true,
                            foodItem: {
                                select: {
                                    foodItemId: true,
                                    name: true,
                                    brand: true,
                                },
                            },
                            portionNutrients: {
                                select: {
                                    amount: true,
                                    nutrient: {
                                        select: {
                                            nutrientId: true,
                                            code: true,
                                            name: true,
                                            unit: true,
                                            type: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }
    });

    return entries;
}

/**
 * Finds a specific diary entry by ID
 * @param {Object} params - The query parameters
 * @param {number} params.diaryEntryId - The diary entry ID
 * @param {number} params.subscriberId - The user's ID
 * @returns {Promise<Object|null>} The diary entry with items and nutrition details, or null if not found
 */
async function findDiaryEntryById({ diaryEntryId, subscriberId }) {
    const retrieval = await prisma.diaryEntry.findUnique({
        where: {
            diaryEntryId,
            subscriberId,
        },
        select: {
            diaryEntryId: true,
            mealType: true,
            consumedAt: true,
            notes: true,
            items: {
                select: {
                    id: true,
                    portionId: true,
                    quantity: true,
                    portion: {
                        select: {
                            description: true,
                            weightG: true,
                            foodItem: {
                                select: {
                                    foodItemId: true,
                                    name: true,
                                    brand: true,
                                },
                            },
                            portionNutrients: {
                                select: {
                                    amount: true,
                                    nutrient: {
                                        select: {
                                            nutrientId: true,
                                            code: true,
                                            name: true,
                                            unit: true,
                                            type: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            diaryEntryId: true,
        }
    });

    return retrieval;
}

/**
 * Checks if a user owns a specific diary entry
 * @param {Object} params - The check parameters
 * @param {number} params.userId - The user's ID
 * @param {number} params.diaryEntryId - The diary entry ID
 * @returns {Promise<boolean>} True if user owns the entry, false otherwise
 */
async function checkDiaryEntryOwnership({ userId, diaryEntryId }) {
    const entry = await prisma.diaryEntry.findFirst({
        where: {
            diaryEntryId: diaryEntryId,
            subscriberId: userId
        },
        select: { 
            diaryEntryId: true
        }
    });
    
    if (entry == null) {
        return false;
    }

    return true;
}

/**
 * Checks if a user owns a specific diary entry item
 * @param {Object} params - The check parameters
 * @param {number} params.userId - The user's ID
 * @param {number} params.diaryEntryItemId - The diary entry item ID
 * @returns {Promise<boolean>} True if user owns the item, false otherwise
 */
async function checkDiaryEntryItemOwnership({ userId, diaryEntryItemId }) {
    const item = await prisma.diaryEntryItem.findFirst({
        where: {
            id: diaryEntryItemId,
            diaryEntry: {
                subscriberId: userId
            }
        },
        select: { 
            id: true
        }
    });

    if (item == null) {
        return false;
    }

    return true;
}

/**
 * Creates a new diary entry item (food portion consumed in a meal)
 * @param {Object} params - The item parameters
 * @param {number} params.diaryEntryId - The diary entry ID
 * @param {number} params.quantity - Quantity consumed
 * @param {number} params.portionId - The food portion ID
 * @returns {Promise<Object>} The created diary entry item with food details
 */
async function createDiaryEntryItem({ diaryEntryId, quantity, portionId }) {
    return prisma.diaryEntryItem.create({
        data: {
            diaryEntryId,
            quantity,
            portionId
        },
        select: {
            id: true,
            diaryEntryId: true,
            portionId: true,
            quantity: true,
            portion: {
                select: {
                    description: true,
                    weightG: true,
                    foodItem: {
                        select: {
                            foodItemId: true,
                            name: true,
                            brand: true,
                            source: true,
                        },
                    },
                },
            },
        },
    });
}

/**
 * Updates an existing diary entry item
 * @param {Object} params - The update parameters
 * @param {number} params.diaryEntryItemId - The diary entry item ID
 * @param {number} [params.portionId] - New portion ID (optional)
 * @param {number} [params.quantity] - New quantity (optional)
 * @returns {Promise<Object|null>} The updated item or null if not found
 */
async function updateDiaryEntryItem({ diaryEntryItemId, portionId, quantity }) {
    try {
        const entry = await prisma.diaryEntryItem.update({
            where: {
                id: diaryEntryItemId,
            },
            data: { // field(s) to change
                ...(portionId !== undefined ? { portionId } : {}),
                ...(quantity !== undefined ? { quantity } : {}),
            },
            select: {
                id: true,
                diaryEntryId: true,
                portionId: true,
                quantity: true,
                portion: {
                    select: {
                        description: true,
                        weightG: true,
                        foodItem: {
                            select: {
                                foodItemId: true,
                                name: true,
                                brand: true,
                                source: true,
                            },
                        },
                    },
                },
            },
        });

        return entry;
    } catch(error) {
        if (error.code === "P2025") {
            return null;
        }
        throw error;
    }

}

/**
 * Deletes a diary entry and all its associated items
 * @param {Object} params - The delete parameters
 * @param {number} params.diaryEntryId - The diary entry ID to delete
 * @returns {Promise<Object|null>} The deleted entry or null if not found
 */
async function deleteDiaryEntry({ diaryEntryId }) {
    try {
        const [, deletedEntry] = await prisma.$transaction([
            prisma.diaryEntryItem.deleteMany({
                where: { diaryEntryId }
            }),
            prisma.diaryEntry.delete({
                where: {
                    diaryEntryId // delete a diary entry based on the diaryID
                }
            })
        ]);

        return deletedEntry;
    } catch(error) {
        if (error.code === "P2025") {
            return null;
        }
        throw error;
    }

}

/**
 * Deletes a specific diary entry item
 * @param {Object} params - The delete parameters
 * @param {number} params.diaryEntryItemId - The diary entry item ID to delete
 * @returns {Promise<Object|null>} The deleted item or null if not found
 */
async function deleteDiaryEntryItem({ diaryEntryItemId }) {
    try {
        const entry = await prisma.diaryEntryItem.delete({
            where: {
                id: diaryEntryItemId // delete a diary entry item based on the item ID
            }
        });

        return entry;
    } catch (error) {
        if (error.code === "P2025") {
            return null;
        }
        throw error;
    }

}

/**
 * Gets the total number of distinct days a user has logged food entries
 * @param {Object} params - The query parameters
 * @param {number} params.subscriberId - The user's ID
 * @returns {Promise<number>} Count of distinct days with logged entries
 */
async function getDaysLogged({ subscriberId }) {
    const [{ days_logged }] = await prisma.$queryRaw `
        SELECT COUNT(DISTINCT DATE(consumed_at))::int AS days_logged
        FROM diary_entry
        WHERE subscriber_id = ${subscriberId}
        `;


    return days_logged;
}

/**
 * Inserts a new food item into the database
 * @param {Object} params - The food item parameters
 * @param {string} params.name - Food item name
 * @param {string} [params.brand] - Brand name (optional)
 * @param {string} params.source - Source of the food (user, fatsecret, system)
 * @param {string} [params.externalId] - External ID from source API (optional)
 * @param {number} [params.createdByUserId] - User who created this custom food (optional)
 * @returns {Promise<Object>} The created food item
 */
async function insertFoodItem({ name, brand, source, externalId, createdByUserId }) {
    return prisma.foodItem.create({
        data: { name, brand, source, externalId, createdByUserId },
    });
}

/**
 * Inserts a new food portion with its nutrient information
 * @param {Object} params - The portion parameters
 * @param {number} params.foodItemId - The food item ID
 * @param {string} params.description - Portion description (e.g., "1 cup", "100g")
 * @param {number} [params.weightG] - Weight in grams (optional)
 * @param {Array<Object>} params.nutrients - Array of nutrient objects with nutrientId and amount
 * @returns {Promise<Object>} The created food portion with nutrients
 */
async function insertFoodPortion({ foodItemId, description, weightG, nutrients }) {
    return prisma.foodPortion.create({
        data: {
            foodItemId,
            description,
            weightG,
            portionNutrients: {
                create: nutrients.map(n => ({
                    nutrientId: n.nutrientId,
                    amount: n.amount,
                })),
            },
        },
        include: { portionNutrients: true },
    });
}

/**
 * Fetches weekly calorie trend data for a user
 * @param {Object} params - The query parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {Date} params.fromDate - Start date of the week
 * @param {Date} params.toDate - End date of the week
 * @returns {Promise<Array>} Array of objects with date and calories for each day
 */
async function fetchWeeklyCalorieTrend({ subscriberId, fromDate, toDate }) {
    return prisma.$queryRaw`
        SELECT 
            DATE(de.consumed_at) as date,
            COALESCE(SUM(fpn.amount * dei.quantity), 0) as calories
        FROM diary_entry de
        JOIN diary_entry_item dei ON dei.diary_entry_id = de.diary_entry_id
        JOIN food_portion_nutrient fpn ON fpn.portion_id = dei.portion_id
        JOIN nutrient n ON n.nutrient_id = fpn.nutrient_id
        WHERE de.subscriber_id = ${subscriberId}
            AND de.consumed_at >= ${fromDate}
            AND de.consumed_at < ${toDate}
            AND n.code = 'calories'
        GROUP BY DATE(de.consumed_at)
        ORDER BY DATE(de.consumed_at)
    `;
}

/**
 * Checks if a food item already exists by external ID
 * @param {string} externalId - The external ID from FatSecret API
 * @returns {Promise<Object|null>} The existing food item or null if not found
 */
async function checkExistingFoodItemByExternalId(externalId) {
    return prisma.foodItem.findUnique({
        where: {
            source_externalId: {
                source: "fatsecret",
                externalId: externalId
            }
        }
    });
}

/**
 * Finds the food portion for a recipe to be added to diary
 * @param {Object} params - The query parameters
 * @param {number} params.recipeId - The recipe ID
 * @returns {Promise<Object|null>} The food item with portion details or null if not found
 */
async function findRecipePortionForDiary({ recipeId }) {
    return prisma.foodItem.findFirst({
        where: {
            source: "system",
            externalId: `recipe:${recipeId}`,
        },
        select: {
            foodItemId: true,
            portions: {
                where: {
                    description: "1 serving",
                },
                select: {
                    portionId: true,
                },
                take: 1,
            },
        },
    });
}

export { insertDiaryEntry, fetchSummaryData, listDiaryEntries, findDiaryEntryById, checkDiaryEntryOwnership, checkDiaryEntryItemOwnership, createDiaryEntryItem, updateDiaryEntryItem, deleteDiaryEntry, deleteDiaryEntryItem, getDaysLogged, insertFoodItem, insertFoodPortion, fetchWeeklyCalorieTrend, checkExistingFoodItemByExternalId, findRecipePortionForDiary };
