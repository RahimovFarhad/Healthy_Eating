import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  listRecipes,
  getRecipeById,
  submitRecipeReview,
  toggleRecipeFavourite,
  getFavouriteRecipes
} from "./recipes.controller.js";

const recipesRouter = Router();

recipesRouter.get("/", listRecipes);
recipesRouter.get("/:id", getRecipeById);
recipesRouter.post("/:id/reviews", requireAuth, submitRecipeReview);
recipesRouter.post("/:id/favourites", requireAuth, toggleRecipeFavourite);

recipesRouter.get("/favourites", requireAuth, getFavouriteRecipes);

export default recipesRouter;
