/**
 * Recipes controller module
 * Handles HTTP requests for recipe management endpoints
 * @module recipes/controller
 */

import {
  listRecipesService,
  getRecipeByIdService,
  submitRecipeReviewService,
  toggleRecipeFavoriteService,
  toggleRecipeUsageService,
  getFavoriteRecipesService,
  getUsedRecipesService,
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
    const subscriberId = req.user?.userId ?? null;

    const recipes = await listRecipesService({ category, cuisine, ingredients, subscriberId });

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
    const subscriberId = req.user?.userId ?? null;
    const recipe = await getRecipeByIdService({ recipeId, subscriberId });

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

async function toggleRecipeUsage(req, res, next) {
  try {
    const { id: recipeId } = req.params;
    const subscriberId = req.user?.userId ?? null;
    const usage = await toggleRecipeUsageService({ recipeId, subscriberId });

    return res.status(200).json({ usage });
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
    const recipes = await getFavoriteRecipesService({ subscriberId });
    return res.status(200).json({ recipes });
  } catch (error) {
    if (error instanceof RecipeError) {
      return res.status(400).json({ error: error.message });
    }
    return next(error);
  }
}

async function getUsedRecipes(req, res, next) {
  try {
    const subscriberId = req.user?.userId ?? null;
    const recipes = await getUsedRecipesService({ subscriberId });
    return res.status(200).json({ recipes });
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
  toggleRecipeUsage,
  getFavoriteRecipes,
  getUsedRecipes
};
