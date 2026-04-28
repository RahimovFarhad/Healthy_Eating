import { validateListRecipesInput, validatePositiveInteger, validateReviewInput } from "./recipes.validator.js";
import { listRecipes, findRecipeById, createRecipeReview, toggleRecipeFavorite } from "./recipes.repository.js";

async function listRecipesService({ category, cuisine, ingredients }) {
  const filters = validateListRecipesInput({ category, cuisine, ingredients });
  const recipes = await listRecipes(filters);
  return processReturnedRecipes(recipes);
}

async function getRecipeByIdService({ recipeId }) {
  const normalizedRecipeId = validatePositiveInteger({ value: recipeId });
  const recipe = await findRecipeById({ recipeId: normalizedRecipeId });
  if (!recipe) return null;
  return processReturnedRecipes([recipe])[0];
}

async function submitRecipeReviewService({ recipeId, subscriberId, rating, comment }) {
  const normalizedRecipeId = validatePositiveInteger({ value: recipeId });
  const normalizedSubscriberId = validatePositiveInteger({ value: subscriberId });
  const reviewValues = validateReviewInput({ rating, comment });

  return createRecipeReview({
    recipeId: normalizedRecipeId,
    subscriberId: normalizedSubscriberId,
    rating: reviewValues.rating,
    comment: reviewValues.comment,
  });
}

async function toggleRecipeFavoriteService({ recipeId, subscriberId }) {
  const normalizedRecipeId = validatePositiveInteger({ value: recipeId });
  const normalizedSubscriberId = validatePositiveInteger({ value: subscriberId });

  return toggleRecipeFavorite({ recipeId: normalizedRecipeId, subscriberId: normalizedSubscriberId });
}

async function getFavoriteRecipesService({ subscriberId, category, cuisine, ingredients }) {
  const normalizedSubscriberId = validatePositiveInteger({ value: subscriberId });
  const filters = validateListRecipesInput({ category, cuisine, ingredients });
  const recipes = await listRecipes({ ...filters, favoritedBySubscriberId: normalizedSubscriberId });
  return processReturnedRecipes(recipes);
}

function processReturnedRecipes(recipes) { // here, we will only average the rating and extract ingredient names
  const averageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return null;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }

  return recipes.map((recipe) => {
    const { recipeIngredients, ...recipeWithoutIngredients } = recipe;
    return {
      ...recipeWithoutIngredients,
      averageRating: averageRating(recipe.reviews),
      ingredients: recipeIngredients.map((ri) => ri.ingredient.name),
    };
  });

}

export {
  listRecipesService,
  getRecipeByIdService,
  submitRecipeReviewService,
  toggleRecipeFavoriteService,
  getFavoriteRecipesService
};
