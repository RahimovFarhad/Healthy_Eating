/**
 * Meal plans repository module
 * Handles database operations for meal plans and plan items
 * @module meal-plans/repository
 */

import { prisma } from "../../db/prisma.js";

const PLAN_SELECT = {
    planId: true,
    subscriberId: true,
    planType: true,
    startDate: true,
    endDate: true,
    createdAt: true,
    planItems: {
        select: {
            planItemId: true,
            planId: true,
            plannedDate: true,
            mealType: true,
            recipeId: true,
            servings: true,
            recipe: { select: { title: true } },
        },
        orderBy: [{ plannedDate: "asc" }, { planItemId: "asc" }],
    },
};

async function createMealPlan({
    subscriberId,
    startDate,
    endDate,
    planType,
    items,
}) {
    return prisma.plan.create({
        data: {
            subscriberId,
            startDate,
            endDate,
            planType,
            planItems: {
                create: (items ?? []).map((item) => ({
                    plannedDate: item.plannedDate,
                    mealType: item.mealType,
                    recipeId: item.recipeId,
                    servings: item.servings,
                })),
            },
        },
        select: PLAN_SELECT, // I will add this
    });
}

async function listMealPlans({ subscriberId, startDate, endDate }) {
    return prisma.plan.findMany({
        where: {
            subscriberId,
            ...(startDate && { startDate: { gte: startDate } }),
            ...(endDate && { endDate: { lte: endDate } }),
        },
        select: PLAN_SELECT,

    });
}

async function getMealPlanById({ planId, subscriberId }) {
    return prisma.plan.findFirst({
        where: {
            planId,
            subscriberId,
        },
        select: PLAN_SELECT,
    });
}

async function deleteMealPlan({ planId, subscriberId }) {
    return prisma.plan.deleteMany({
        where: {
            planId,
            subscriberId,
        },
    });
}

async function addPlanItem({ planId, item }) {
    return prisma.planItem.create({
        data: {
            planId,
            plannedDate: item.plannedDate,
            mealType: item.mealType,
            recipeId: item.recipeId,
            servings: item.servings,
        },
    });

}

async function removePlanItem({ planItemId, planId, subscriberId }) {
    const plan = await prisma.plan.findFirst({ where: { planId, subscriberId } });
    if (!plan) return { count: 0 };
    return prisma.planItem.deleteMany({ where: { planItemId, planId } });
}

export { createMealPlan, listMealPlans, getMealPlanById, deleteMealPlan, addPlanItem, removePlanItem };
