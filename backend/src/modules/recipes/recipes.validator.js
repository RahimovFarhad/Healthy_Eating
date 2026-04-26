class RecipeError extends Error {
  constructor(message) {
    super(message);
    this.name = "RecipeError";
  }
}

function normalizePositiveInteger(value) {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function validateListRecipesInput({ category, cuisine, ingredients }) {
  const normalizedCategory =
    typeof category === "string" && category.trim() !== "" ? category.trim() : null;
  const normalizedCuisine =
    typeof cuisine === "string" && cuisine.trim() !== "" ? cuisine.trim() : null;

  if (ingredients != null && !Array.isArray(ingredients)) {
    throw new RecipeError("Ingredients must be an array");
  }

  const normalizedIngredients = (ingredients ?? [])
    .map((ingredient) => {
      if (typeof ingredient !== "string") {
        throw new RecipeError("Each ingredient must be a string");
      }
      return ingredient.trim();
    })
    .filter(Boolean); // if empty string, just remove it

  return {
    category: normalizedCategory,
    cuisine: normalizedCuisine,
    ingredients: normalizedIngredients,
  };
}

function validatePositiveInteger({ value }){
  const normalized = normalizePositiveInteger(value);
    if (!value) {
      throw new GoalError("Value is required");
    }
    return normalized;
}

function validateReviewInput({ rating, comment }) {
  const normalizedRating = normalizePositiveInteger(rating);
  if (normalizedRating == null || normalizedRating < 1 || normalizedRating > 5) {
    throw new RecipeError("Rating must be an integer between 1 and 5");
  }

  const normalizedComment =
    typeof comment === "string" && comment.trim() !== "" ? comment.trim() : null;

  return { rating: normalizedRating, comment: normalizedComment };
}

export { RecipeError, validateListRecipesInput, validatePositiveInteger };
