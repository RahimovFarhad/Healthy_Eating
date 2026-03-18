import { Router } from "express";
import { createEntry, getSummary, listDiaryEntries, getDiaryEntryById, createDiaryEntryItem, updateDiaryEntryItem, deleteEntry, deleteEntryItem, getDashboard } from "./diary.controller.js";
const diaryRouter = Router();

// Auth middleware will be added here later.
diaryRouter.post("/entries", createEntry);
diaryRouter.get("/summary", getSummary);
diaryRouter.get("/entries", listDiaryEntries); 
<<<<<<< HEAD
diaryRouter.get("/entries/:id", getDiaryEntryById); // should check if current user is trying to access their own diary entry
diaryRouter.delete("/entries/:id", deleteEntry); // should check if current user is trying to delete their own diary entry
diaryRouter.post("/entries/:id/items", createDiaryEntryItem); // user can only add to their own diary; If entry item is custom, first create it. 
diaryRouter.patch("/entry-items/:itemId", updateDiaryEntryItem); // check if user is trying to update their own diary entry item;
diaryRouter.delete("/entry-items/:itemId", deleteEntryItem); // check if user is trying to delete their own diary entry item;
=======
diaryRouter.get("/entries/:id", getDiaryEntryById); // incomplete, should check if current user is trying to access their own diary entry
diaryRouter.delete("/entries/:id", deleteEntry); //incomplete, should check if current user is trying to delete their own diary entry
diaryRouter.post("/entries/:id/items", createDiaryEntryItem); // incomplete: user can only add to their own diary  
diaryRouter.patch("/entry-items/:itemId", updateDiaryEntryItem); // incomplete, check if user is trying to update their own diary entry item;
diaryRouter.delete("/entry-items/:itemId", deleteEntryItem); // incomplete, check if user is trying to delete their own diary entry item;
>>>>>>> 39c7a0679d629f8ac85b51805ff2b1789eea4571

// Returns all summary information required to render the user dashboard in a single request. The endpoint aggregates small preview data from several modules (food diary, nutrition tracking, goals, messaging, and recipes). It is designed only for the dashboard initial load and should not return full datasets.
diaryRouter.get("/dashboard", getDashboard)


export default diaryRouter;
