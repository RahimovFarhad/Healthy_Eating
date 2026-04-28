class MealPlanError extends Error {
  constructor(message) {
    super(message);
    this.name = "MealPlanError";
  }
}



function validateCreateMealPlanInput({ subscriberId, startDate, endDate, planType, items }) {
  const normalizedSubscriberId = normalizePositiveInteger(subscriberId);
  if (!normalizedSubscriberId) {
    throw new MealPlanError("Subscriber ID must be a positive integer");
}
    
  const validatedStartDate = validateDate(startDate);
  if (!validatedStartDate) {
    throw new MealPlanError("Invalid start date");
  }
  const validatedEndDate = validateDate(endDate);
  if (!validatedEndDate) {
    throw new MealPlanError("Invalid end date");
  }
  if (validatedEndDate < validatedStartDate) {
    throw new MealPlanError("End date cannot be before start date");
  }

  const normalizedPlanType =
    typeof planType === "string" && planType.trim() !== "" ? planType.trim() : null;
  if (!normalizedPlanType) {
    throw new MealPlanError("Plan type is required");
  }
  if (!["auto_suggested", "template", "manual"].includes(normalizedPlanType)) {
    throw new MealPlanError("Invalid plan type");
  }

  if (items != null && !Array.isArray(items)) {
    throw new MealPlanError("Items must be an array");
  }

  // for each item, validate and inside map, log the item
  const validatedItems = (items ?? []).map((item) => {
      let i = validatePlanItem(item);
      if (i.plannedDate < validatedStartDate || i.plannedDate > validatedEndDate) {
        throw new MealPlanError("Planned date must be within the start and end date of the meal plan");
      }
      return i;

  });

  return {
    subscriberId: normalizedSubscriberId,
    startDate: validatedStartDate,
    endDate: validatedEndDate,
    planType: normalizedPlanType,
    items: validatedItems,
  };
        
}

function validateListMealPlansInput({ subscriberId, startDate, endDate }) {
    const normalizedSubscriberId = normalizePositiveInteger(subscriberId);
    if (!normalizedSubscriberId) {
      throw new MealPlanError("Subscriber ID must be a positive integer");
    }

    const validatedStartDate = startDate ? validateDate(startDate) : null;
    if (startDate && !validatedStartDate) {
      throw new MealPlanError("Invalid start date");
    }
    const validatedEndDate = endDate ? validateDate(endDate) : null;
    if (endDate && !validatedEndDate) {
      throw new MealPlanError("Invalid end date");
    }
    if (validatedStartDate && validatedEndDate && validatedEndDate < validatedStartDate) {
      throw new MealPlanError("End date cannot be before start date");
    }

    return {
        subscriberId: normalizedSubscriberId,
        startDate: validatedStartDate,
        endDate: validatedEndDate,
    };
}

function validateGetMealPlanByIdInput({ planId, subscriberId }) {
    const normalizedPlanId = normalizePositiveInteger(planId);
    if (!normalizedPlanId) {
      throw new MealPlanError("Plan ID must be a positive integer");
    }
    const normalizedSubscriberId = normalizePositiveInteger(subscriberId);
    if (!normalizedSubscriberId) {
      throw new MealPlanError("Subscriber ID must be a positive integer");
    }
    return {
        planId: normalizedPlanId,
        subscriberId: normalizedSubscriberId,
    };
}

function normalizePositiveInteger(value) {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function validateDate(value) {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function validatePlanItem({ planId, plannedDate, mealType, recipeId, servings }) {
    const normalizedPlanId = normalizePositiveInteger(planId);
    if (!normalizedPlanId) {
      throw new MealPlanError("Plan ID must be a positive integer");
    }

    const validatedPlannedDate = validateDate(plannedDate);
    if (!validatedPlannedDate) {
      throw new MealPlanError("Invalid planned date");
    }

    const normalizedMealType =
      typeof mealType === "string" && mealType.trim() !== "" ? mealType.trim() : null;
    if (!normalizedMealType) {
      throw new MealPlanError("Meal type is required");
    }
    if (!["breakfast", "lunch", "dinner", "snack"].includes(normalizedMealType)) {
      throw new MealPlanError("Invalid meal type");
    }

    const normalizedRecipeId = normalizePositiveInteger(recipeId);
    if (!normalizedRecipeId) {
      throw new MealPlanError("Recipe ID must be a positive integer");
    }

    const normalizedServings = normalizePositiveInteger(servings);
    if (!normalizedServings) {
      throw new MealPlanError("Servings must be a positive integer");
    }

    return {
      planId: normalizedPlanId,
      plannedDate: validatedPlannedDate,
      mealType: normalizedMealType,
      recipeId: normalizedRecipeId,
      servings: normalizedServings,
    };

}

export { MealPlanError, validateCreateMealPlanInput, validateListMealPlansInput, validateGetMealPlanByIdInput, validatePlanItem };