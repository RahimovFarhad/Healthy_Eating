class RecipeError extends Error {
  constructor(message) {
    super(message);
    this.name = "RecipeError";
  }
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

export { RecipeError, validateListRecipesInput };
