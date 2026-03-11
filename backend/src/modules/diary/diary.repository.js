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
async function listDiaryEntry({ subscriberId }) {
    const entries = await prisma.diaryEntry.findMany({
        where: {
            subscriberId
        },
        // attributes shown to client when requested
        select: { 
            items: {
                consumedAt,
                mealType,
                notes
            },
        }
    });

    return entries;
}

// function to GET ALL the entry details
async function retrieveEntries({ diaryEntryId }) {
    const retrieval = await prisma.diaryEntry.findMany({
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

// SQL function for ADDING a specific diary entry
async function newDiaryEntry({ diaryEntryId }) {
    return prisma.items.diaryEntry.create({
        data: {
            diaryEntryId,
            subscriberId,
            quantityG,
            consumedAt,
            mealType,
            notes
        }
    });
}

// SQL function for UPDATING a specific diary entry
async function updateDiaryEntry({ diaryEntryId }) {
    const entry = await prisma.diaryEntry.update({
        where: { // condition for updating
            diaryEntryId
        },
        update: { // field(s) to change
            items: {
                consumedAt: true,
                mealType: true,
                notes: true
            },
        },
        create: { // update with new information
            consumedAt,
            mealType,
            notes
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

export { insertDiaryEntry, fetchSummaryData, listDiaryEntry, retrieveEntries, newDiaryEntry, updateDiaryEntry, deleteDiaryEntry };
