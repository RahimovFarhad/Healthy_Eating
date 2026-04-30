import { prisma } from "../../db/prisma.js";
 
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

// retrieve attributes required for calculating nutrients summary data 
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

// function to just list ALL AVAILABLE entry
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
        }
    });

    return retrieval;
}

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
    }

}

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
    }

}

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
    }
    
}

async function getDaysLogged({ subscriberId }) {
    const [{ days_logged }] = await prisma.$queryRaw `
        SELECT COUNT(DISTINCT DATE(consumed_at))::int AS days_logged
        FROM diary_entry
        WHERE subscriber_id = ${subscriberId}
        `;


    return days_logged;
}

// retrieves attributes to create a new custom food item by the user
async function insertFoodItem({ name, brand, source, externalId, createdByUserId }) {
    return prisma.foodItem.create({
        data: { name, brand, source, externalId, createdByUserId },
    });
}

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
