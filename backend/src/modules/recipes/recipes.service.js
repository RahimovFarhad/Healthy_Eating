async function listRecipesService({ category, cuisine, ingredients }) {
  
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
