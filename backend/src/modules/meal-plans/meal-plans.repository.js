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
    },
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

export { createMealPlan };