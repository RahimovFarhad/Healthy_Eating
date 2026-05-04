import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  listRecipes,
  getRecipeById,
  submitRecipeReview,
  toggleRecipeFavorite,
  getFavoriteRecipes
} from "./recipes.controller.js";

const recipesRouter = Router();

recipesRouter.get("/", requireAuth, listRecipes);
recipesRouter.get("/favorites", requireAuth, getFavoriteRecipes);

recipesRouter.get("/:id", requireAuth, getRecipeById);
recipesRouter.post("/:id/reviews", requireAuth, submitRecipeReview);
recipesRouter.post("/:id/favorites", requireAuth, toggleRecipeFavorite);


export default recipesRouter;
