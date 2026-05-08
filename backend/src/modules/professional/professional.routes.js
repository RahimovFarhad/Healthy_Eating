/**
 * Professional routes module
 * Defines Express routes for professional management endpoints
 * @module professional/routes
 */

import { Router } from "express";
import { getClientDashboard, getClientSummary, inviteClient, listClients, listGoals, listMessages, removeClient, sendMessage, setAsProfessional, setGoal, listInvitations, shareRecipe, listSharedRecipes } from "./professional.controller.js";
import { requireProfessional } from "../../middleware/requireAuth.js";
const professionalRouter = Router();

professionalRouter.patch("/setAsProfessional", setAsProfessional);
professionalRouter.post("/client-invitations", requireProfessional, inviteClient);
professionalRouter.get("/client-invitations", requireProfessional, listInvitations);  // to be implemented

professionalRouter.get("/clients", requireProfessional, listClients); //list of clients for the currently authenticated professional; if include=details, sends with details (risk points + risky nutrients with their goals)
professionalRouter.delete("/clients/:clientId", requireProfessional, removeClient); //professional removes client from their list

// Below are the functions that encapsulate professional's features
professionalRouter.get("/clients/:clientId/summary", requireProfessional, getClientSummary); //same response with /diary/summary endpoint
professionalRouter.get("/clients/:clientId/dashboard", requireProfessional, getClientDashboard); //same response with /diary/dashboard endpoint

professionalRouter.post("/clients/:clientId/messages", requireProfessional, sendMessage);
professionalRouter.get("/clients/:clientId/messages", requireProfessional, listMessages);

professionalRouter.post("/clients/:clientId/shared-recipes", requireProfessional, shareRecipe);
professionalRouter.get("/clients/:clientId/shared-recipes", requireProfessional, listSharedRecipes);

professionalRouter.post("/clients/:clientId/goals", requireProfessional, setGoal);
professionalRouter.get("/clients/:clientId/goals", requireProfessional, listGoals);

export default professionalRouter;
