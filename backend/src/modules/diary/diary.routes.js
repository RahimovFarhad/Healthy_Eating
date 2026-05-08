/**
 * Diary routes module
 * Defines Express routes for food diary and nutrition tracking endpoints
 * @module diary/routes
 */

import { Router } from "express";
import { createEntry, getSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteEntry, deleteEntryItem, getDashboard, createEntryWithRecipe, createRecipeAsDiaryEntryItem } from "./diary.controller.js";

/**
 * Express router for diary endpoints
 * @type {Router}
 */
const diaryRouter = Router();

/**
 * POST /entries - Create a new diary entry
 */
diaryRouter.post("/entries", createEntry);

/**
 * GET /summary - Get nutrition summary for a period
 */
diaryRouter.get("/summary", getSummary);

/**
 * GET /entries - List diary entries with optional filters
 */
diaryRouter.get("/entries", listDiaryEntries);

/**
 * GET /entries/:id - Get a specific diary entry by ID
 */
diaryRouter.get("/entries/:id", getDiaryEntryById);

/**
 * DELETE /entries/:id - Delete a diary entry
 */
diaryRouter.delete("/entries/:id", deleteEntry);

/**
 * POST /entries/:id/items - Add a food item to a diary entry
 */
diaryRouter.post("/entries/:id/items", createDiaryEntryItem);

/**
 * PATCH /entry-items/:itemId - Update a diary entry item
 */
diaryRouter.patch("/entry-items/:itemId", updateDiaryEntryItem);

/**
 * DELETE /entry-items/:itemId - Delete a diary entry item
 */
diaryRouter.delete("/entry-items/:itemId", deleteEntryItem);

/**
 * GET /dashboard - Get comprehensive dashboard data for user
 */
diaryRouter.get("/dashboard", getDashboard)

/**
 * POST /entries/recipe/:recipeId - Create a new diary entry with a recipe
 */
diaryRouter.post("/entries/recipe/:recipeId", createEntryWithRecipe);

/**
 * POST /entries/:id/recipe/:recipeId - Add a recipe to an existing diary entry
 */
diaryRouter.post("/entries/:id/recipe/:recipeId", createRecipeAsDiaryEntryItem); 


export default diaryRouter;
