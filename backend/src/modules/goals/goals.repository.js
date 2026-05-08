/**
 * Goals repository module
 * Handles database operations for nutrition goals and check-ins
 * @module goals/repository
 */

import { prisma } from "../../db/prisma.js";

const GOAL_SELECT = {
    goalId: true,
    subscriberId: true,
    nutrientId: true,
    source: true,
    status: true,
    targetMin: true,
    targetMax: true,
    setByProfessionalId: true,
    startDate: true,
    endDate: true,
    notes: true,
    createdAt: true,
    nutrient: {
        select: {
            nutrientId: true,
            code: true,
            name: true,
            unit: true,
            type: true,
        },
    },
};

/**
 * Converts a date to date-only format (removes time component)
 * @param {Date} [date=new Date()] - The date to convert
 * @returns {Date} Date with time set to midnight
 */
function toDateOnly(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Fetches nutrition goals for a subscriber with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.subscriberId - The user's ID
 * @param {boolean} params.effective - Filter for currently effective goals
 * @param {string} [params.include="none"] - Include check-ins (none, today, all)
 * @returns {Promise<Array>} Array of nutrition goals with optional check-ins
 */
async function fetchGoals({ subscriberId, effective, include = "none" }) {
    const today = new Date();
    const where = {
        subscriberId,
        ...(effective
            ? {
                status: "active",
                startDate: { lte: today },
                OR: [{ endDate: null }, { endDate: { gte: today } }],
            }
            : {}),
    };

    return prisma.nutritionGoal.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { goalId: "desc" }], // for select, if include = "today" or "all" have checkin(s)
        select: { ...GOAL_SELECT,
            ...(include != "none"
                ? {
                    checkIns: {
                        ...(include === "today" && { where: { date: toDateOnly() } }),
                        select: {
                            checkInId: true,
                            date: true,
                            isDone: true,
                        },
                    },
                }
                : {}),
        },
    });
}

/**
 * Finds a nutrient by its ID
 * @param {Object} params - Query parameters
 * @param {number} params.nutrientId - The nutrient ID
 * @returns {Promise<Object|null>} The nutrient or null if not found
 */
async function findNutrientById({ nutrientId }) {
    return prisma.nutrient.findUnique({
        where: { nutrientId },
        select: { nutrientId: true },
    });
}

/**
 * Finds a nutrient by its code
 * @param {Object} params - Query parameters
 * @param {string} params.nutrientCode - The nutrient code (e.g., "protein", "calories")
 * @returns {Promise<Object|null>} The nutrient or null if not found
 */
async function findNutrientByCode({ nutrientCode }) {
    return prisma.nutrient.findUnique({
        where: { code: nutrientCode },
        select: { nutrientId: true },
    });
}

/**
 * Lists all available nutrients
 * @returns {Promise<Array>} Array of all nutrients ordered by type and ID
 */
async function listNutrients() {
    return prisma.nutrient.findMany({
        orderBy: [{ type: "asc" }, { nutrientId: "asc" }],
        select: {
            nutrientId: true,
            code: true,
            name: true,
            unit: true,
            type: true,
        },
    });
}

async function findGoalByIdForSubscriber({ subscriberId, goalId }) {
    return prisma.nutritionGoal.findFirst({
        where: {
            goalId,
            subscriberId,
        },
        select: {
            goalId: true,
            status: true,
            startDate: true,
            endDate: true,
            subscriber: {
                select: {
                    userId: true,
                },
            },
        },
    });
}

async function archiveGoal({ goalId, archivedAt }) {
    return prisma.nutritionGoal.update({
        where: { goalId },
        data: {
            status: "archived",
            endDate: archivedAt,
        },
        select: GOAL_SELECT,
    });
}

async function updateGoal({ goalId, data }) {
    return prisma.nutritionGoal.update({
        where: { goalId },
        data,
        select: GOAL_SELECT,
    });
}

async function insertGoal({
    subscriberId,
    nutrientId,
    source,
    status,
    targetMin,
    targetMax,
    setByProfessionalId,
    startDate,
    endDate,
    notes,
}) {
    return prisma.nutritionGoal.create({
        data: {
            subscriberId,
            nutrientId,
            source,
            status,
            targetMin,
            targetMax,
            setByProfessionalId,
            startDate,
            endDate,
            notes,
        },
        select: {
            ...GOAL_SELECT,
            setByProfessionalId: true,
        }

    });
}

// archives all currently active goals for a given subscriber and nutrient
async function archiveGoalsForNutrient({ subscriberId, nutrientId }) {
    return prisma.nutritionGoal.updateMany({
        where: { subscriberId, nutrientId, status: "active" },
        data: { status: "archived", endDate: new Date() },
    });
}

async function findGuidelinesByDemographic(demographic, tx) {
    const client = tx ?? prisma;
    return client.guideline.findMany({
        where: { demographic },
        select: {
            nutrientId: true,
            minValue: true,
            maxValue: true,
        },
    });
}

async function createManyGoals(rows, tx) {
    const client = tx ?? prisma;
    return client.nutritionGoal.createMany({ data: rows });
}

async function findGoalCheckInByDate({ goalId, date }) {
    return prisma.goalCheckIn.findUnique({
        where: {
            goalId_date: {
                goalId,
                date,
            },
        },
        select: {
            checkInId: true,
            goalId: true,
            date: true,
            isDone: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

async function createGoalCheckIn({ goalId, date, isDone = true }) {
    return prisma.goalCheckIn.create({
        data: {
            goalId,
            date,
            isDone,
        },
        select: {
            checkInId: true,
            goalId: true,
            date: true,
            isDone: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

async function updateGoalCheckIn({ checkInId, isDone }) {
    return prisma.goalCheckIn.update({
        where: { checkInId },
        data: { isDone },
        select: {
            checkInId: true,
            goalId: true,
            date: true,
            isDone: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

async function upsertGoalCheckIn({ goalId, date, isDone }) {
    return prisma.goalCheckIn.upsert({
        where: {
            goalId_date: {
                goalId,
                date,
            },
        },
        update: {
            isDone,
        },
        create: {
            goalId,
            date,
            isDone,
        },
        select: {
            checkInId: true,
            goalId: true,
            date: true,
            isDone: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export {
    fetchGoals,
    findNutrientById,
    findNutrientByCode,
    listNutrients,
    findGoalByIdForSubscriber,
    archiveGoal,
    archiveGoalsForNutrient,
    updateGoal,
    insertGoal,
    findGuidelinesByDemographic,
    createManyGoals,
    findGoalCheckInByDate,
    createGoalCheckIn,
    updateGoalCheckIn,
    upsertGoalCheckIn,
};
