import { Router } from "express";
import { createEntry, getSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteEntry, deleteEntryItem, getDashboard, createEntryWithRecipe, createRecipeAsDiaryEntryItem } from "./diary.controller.js";
const diaryRouter = Router();

// Auth middleware will be added here later.
diaryRouter.post("/entries", createEntry);
diaryRouter.get("/summary", getSummary); // user can retrieve their nutritional summary
diaryRouter.get("/entries", listDiaryEntries); // user can access their existing diary entries
diaryRouter.get("/entries/:id", getDiaryEntryById); // checks if current user is trying to access their own diary entry
diaryRouter.delete("/entries/:id", deleteEntry); // checks if current user is trying to delete their own diary entry
diaryRouter.post("/entries/:id/items", createDiaryEntryItem); // user can only add to their own diary; If entry item is custom, first create it. 
diaryRouter.patch("/entry-items/:itemId", updateDiaryEntryItem); // check if user is trying to update their own diary entry item;
diaryRouter.delete("/entry-items/:itemId", deleteEntryItem); // check if user is trying to delete their own diary entry item;

// Returns all summary information required to render the user dashboard in a single request. The endpoint aggregates small preview data from several modules (food diary, nutrition tracking, goals, messaging, and recipes). It is designed only for the dashboard initial load and should not return full datasets.
diaryRouter.get("/dashboard", getDashboard)

diaryRouter.post("/entries/recipe/:recipeId", createEntryWithRecipe);
diaryRouter.post("/entries/:id/recipe/:recipeId", createRecipeAsDiaryEntryItem); 


export default diaryRouter;
