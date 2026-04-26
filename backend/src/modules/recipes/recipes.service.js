import { validateListRecipesInput, validatePositiveInteger, validateReviewInput } from "./recipes.validator.js";
import { listRecipes, findRecipeById, createRecipeReview, toggleRecipeFavourite } from "./recipes.repository.js";

async function listRecipesService({ category, cuisine, ingredients }) {
  const filters = validateListRecipesInput({ category, cuisine, ingredients });
  return processReturnedRecipes(listRecipes(filters));
}

async function getRecipeByIdService({ recipeId }) {
  const normalizedRecipeId = validatePositiveInteger({ value: recipeId });
  return processReturnedRecipes(findRecipeById({ recipeId: normalizedRecipeId }));
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

async function toggleRecipeFavouriteService({ recipeId, subscriberId }) {
  const normalizedRecipeId = validatePositiveInteger({ value: recipeId });
  const normalizedSubscriberId = validatePositiveInteger({ value: subscriberId });

  return toggleRecipeFavourite({ recipeId: normalizedRecipeId, subscriberId: normalizedSubscriberId });
}

async function getFavouriteRecipesService({ subscriberId, category, cuisine, ingredients }) {
  const normalizedSubscriberId = validatePositiveInteger({ value: subscriberId });
  const filters = validateListRecipesInput({ category, cuisine, ingredients });
  return listRecipes({ ...filters, favouritedBySubscriberId: normalizedSubscriberId });
}

function processReturnedRecipes(recipes) { // here, we will only average the rating and extract ingredient names
  averageRating = (reviews) => {
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
  toggleRecipeFavouriteService,
  getFavouriteRecipesService
};
