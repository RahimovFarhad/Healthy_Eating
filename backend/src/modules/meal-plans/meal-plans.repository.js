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