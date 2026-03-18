import { Router } from "express";
import { createEntry, getSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteEntry, deleteEntryItem } from "./diary.controller.js";
const diaryRouter = Router();

// Auth middleware will be added here later.
diaryRouter.post("/entries", createEntry);
diaryRouter.get("/summary", getSummary);
diaryRouter.get("/entries", listDiaryEntries); 
diaryRouter.get("/entries/:id", getDiaryEntryById); // should check if current user is trying to access their own diary entry
diaryRouter.delete("/entries/:id", deleteEntry); // should check if current user is trying to delete their own diary entry
diaryRouter.post("/entries/:id/items", createDiaryEntryItem); // user can only add to their own diary; If entry item is custom, first create it. 
diaryRouter.patch("/entry-items/:itemId", updateDiaryEntryItem); // check if user is trying to update their own diary entry item;
diaryRouter.delete("/entry-items/:itemId", deleteEntryItem); // check if user is trying to delete their own diary entry item;

export default diaryRouter;
