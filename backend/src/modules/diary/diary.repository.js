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

export { insertDiaryEntry, fetchSummaryData };
