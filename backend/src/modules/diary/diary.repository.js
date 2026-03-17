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
                        foodItem: {
                            select: {
                                foodNutrients: {
                                    select: {
                                        nutrient: true,
                                        amountPer100g: true,
                                    },
                            },
                        },
                        quantityG: true,
                    },
                },
            },
        }
    });

    // example json: { items: [ { foodItem: { foodNutrients: [ { nutrient: { name: "Protein" }, amountPer100g: 10 } ] }, quantityG: 150 } ] }

    return foods; 
    
}

// function to just list ALL AVAILABLE entry
async function listDiaryEntries({ subscriberId, consumedAt, mealType, notes }) {
    // add more filters 
    const entries = await prisma.diaryEntry.findMany({
        where: { 
            subscriberId,
            mealType: mealType ? { equals: mealType } : undefined,
            notes: notes ? { equals: notes } : undefined,
            consumedAt: consumedAt ? { gte: new Date(consumedAt) } : undefined,
        },  
        // attributes shown to client when requested
        select: { 
            items: {
                foodItem: {
                    select: {
                        foodNutrients: {
                            select: {
                                type: true,
                                unit: true
                            },
                        },
                    },
                    quantityG: true,
                },
            },
        }
    });

    return entries;
}

// function to GET ALL the entry details
async function findDiaryEntryById({ diaryEntryId }) {
    const retrieval = await prisma.diaryEntry.findUnique({
        where: {
            diaryEntryId
        },
        select: { 
            items: {
                foodItem: {
                    select: {
                        foodNutrients: {
                            select: {
                                type: true,
                                unit: true
                            },
                        },
                    },
                    quantityG: true,
                },
            },
        }
    });

    return retrieval;
}

// SQL function for CREATING a new diary entry item
async function createDiaryEntryItem({ diaryEntryId, quantityG, foodItemId }) {
    return prisma.diaryEntryItem.create({
        data: {
            diaryEntryId,
            quantityG,
            foodItemId
        }
    });
}

// SQL function for UPDATING a specific diary entry
async function updateDiaryEntryItem({ diaryEntryItemId, foodItemId, quantityG }) {
    const entry = await prisma.diaryEntryItem.update({
        where: { // condition for updating
            id: diaryEntryItemId
        },
        data: { // field(s) to change
            ...(foodItemId !== undefined ? { foodItemId } : {}),
            ...(quantityG !== undefined ? { quantityG } : {}),
        }
    });

    return entry;
}

// SQL function for retrieving a specific diary entry to DELETE
async function deleteDiaryEntry({ diaryEntryId }) {
    const entry = await prisma.diaryEntry.delete({
        where: {
            diaryEntryId // delete a diary entry based on the diaryID
        }
    });

    return entry;
}

async function deleteDiaryEntryItem({ diaryEntryItemId }) {
    const entry = await prisma.diaryEntryItem.delete({
        where: {
            id: diaryEntryItemId // delete a diary entry item based on the item ID
        }
    });

    return entry;
}

export { insertDiaryEntry, fetchSummaryData, listDiaryEntries, findDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteDiaryEntry, deleteDiaryEntryItem };
