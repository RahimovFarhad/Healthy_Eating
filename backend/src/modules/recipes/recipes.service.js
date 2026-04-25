import { validateListRecipesInput } from "./recipes.validator.js";
import { listRecipes } from "./recipes.repository.js";

async function listRecipesService({ category, cuisine, ingredients }) {
  const filters = validateListRecipesInput({ category, cuisine, ingredients });
  return listRecipes(filters);
}

async function getRecipeByIdService({ recipeId }) {}

async function submitRecipeReviewService({ recipeId, subscriberId, rating, comment }) {}

async function toggleRecipeFavouriteService({ recipeId, subscriberId }) {}

async function getFavouriteRecipesService({ subscriberId }) {}

export {
  listRecipesService,
  getRecipeByIdService,
  submitRecipeReviewService,
  toggleRecipeFavouriteService,
  getFavouriteRecipesService
};
