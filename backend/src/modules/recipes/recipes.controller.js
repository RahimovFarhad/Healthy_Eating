import {
  listRecipesService,
  getRecipeByIdService,
  submitRecipeReviewService,
  toggleRecipeFavouriteService,
  getFavouriteRecipesService,
} from "./recipes.service.js";

async function listRecipes(req, res, next) {
  try {
    const category = req.query?.category;
    const cuisine = req.query?.cuisine;
    const rawIngredients = req.query?.ingredients;
    const ingredients = typeof rawIngredients === "string"
      ? rawIngredients.split(",").map((ingredient) => ingredient.trim()).filter(Boolean)
      : [];

    const recipes = await listRecipesService({ category, cuisine, ingredients });

    return res.status(200).json({ recipes });
  } catch (error) {
    return next(error);
  }
}

async function getRecipeById(req, res, next) {
  try {
    const { id: recipeId } = req.params;
    const recipe = await getRecipeByIdService({ recipeId });

    return res.status(200).json({ recipe });
  } catch (error) {
    return next(error);
  }
}

async function submitRecipeReview(req, res, next) {
  try {
    const { id: recipeId } = req.params;
    const subscriberId = req.user?.userId ?? null;
    const { rating, comment } = req.body ?? {};

    const review = await submitRecipeReviewService({
      recipeId,
      subscriberId,
      rating,
      comment,
    });

    return res.status(201).json({ review });
  } catch (error) {
    return next(error);
  }
}

async function toggleRecipeFavourite(req, res, next) {
  try {
    const { id: recipeId } = req.params;
    const subscriberId = req.user?.userId ?? null;
    const favourite = await toggleRecipeFavouriteService({ recipeId, subscriberId });

    return res.status(200).json({ favourite });
  } catch (error) {
    return next(error);
  }
}

async function getFavouriteRecipes(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const favRecipes = getFavouriteRecipesService({ subscriberId });
    return res.status(200).json({ favRecipes });
  } catch (error) {
    
  }
}

export {
  listRecipes,
  getRecipeById,
  submitRecipeReview,
  toggleRecipeFavourite,
  getFavouriteRecipes
};
