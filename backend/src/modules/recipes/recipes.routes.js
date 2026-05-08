/**
 * Recipes routes module
 * Defines Express routes for recipe management endpoints
 * @module recipes/routes
 */

import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  listRecipes,
  getRecipeById,
  submitRecipeReview,
  toggleRecipeFavorite,
  toggleRecipeUsage,
  getFavoriteRecipes,
  getUsedRecipes
} from "./recipes.controller.js";

const recipesRouter = Router();

recipesRouter.get("/", requireAuth, listRecipes);
recipesRouter.get("/favorites", requireAuth, getFavoriteRecipes);
recipesRouter.get("/used", requireAuth, getUsedRecipes);

recipesRouter.get("/:id", requireAuth, getRecipeById);
recipesRouter.post("/:id/reviews", requireAuth, submitRecipeReview);
recipesRouter.post("/:id/favorite", requireAuth, toggleRecipeFavorite);
recipesRouter.post("/:id/usage", requireAuth, toggleRecipeUsage);


export default recipesRouter;
