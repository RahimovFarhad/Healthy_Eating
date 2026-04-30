import {
  listRecipesService,
  getRecipeByIdService,
  submitRecipeReviewService,
  toggleRecipeFavoriteService,
  getFavoriteRecipesService,
} from "./recipes.service.js";

import { RecipeError } from "./recipes.validator.js";

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
    if (error instanceof RecipeError) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
}

async function getRecipeById(req, res, next) {
  try {
    const { id: recipeId } = req.params;
    const recipe = await getRecipeByIdService({ recipeId });

    return res.status(200).json({ recipe });
  } catch (error) {
    if (error instanceof RecipeError) {
      return res.status(400).json({ error: error.message });
    }
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
    if (error instanceof RecipeError) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
}

async function toggleRecipeFavorite(req, res, next) {
  try {
    const { id: recipeId } = req.params;
    const subscriberId = req.user?.userId ?? null;
    const favorite = await toggleRecipeFavoriteService({ recipeId, subscriberId });

    return res.status(200).json({ favorite });
  } catch (error) {
    if (error instanceof RecipeError) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
}

async function getFavoriteRecipes(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const favRecipes = await getFavoriteRecipesService({ subscriberId });
    return res.status(200).json({ favRecipes });
  } catch (error) {
    if (error instanceof RecipeError) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
}

export {
  listRecipes,
  getRecipeById,
  submitRecipeReview,
  toggleRecipeFavorite,
  getFavoriteRecipes
};
