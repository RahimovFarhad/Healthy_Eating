import { Router } from "express";
import { createEntry, getSummary, listEntries, getEntryDetail, addEntryItem, updateEntryItem, deleteEntryItem } from "./diary.controller.js";

const diaryRouter = Router();

// Auth middleware will be added here later.
diaryRouter.post("/entries", createEntry);
diaryRouter.get("/summary", getSummary);
diaryRouter.get("/entries", listEntries);
diaryRouter.get("/entries/:id", getEntryDetail);
diaryRouter.post("/entries/:id/items", addEntryItem);
diaryRouter.patch("/entries/:id/items/:itemId", updateEntryItem);
diaryRouter.delete("/entries/:id/items/:itemId", deleteEntryItem);

export default diaryRouter;
