import { Router } from "express";
const professionalRouter = Router();

professionalRouter.patch("/setAsProfessional", setAsProfessional);
professionalRouter.post("/client-invitations", inviteClient);

professionalRouter.get("/clients", listClients); //list of clients for the currently authenticated professional; if include=details, sends with details (risk points + risky nutrients with their goals)
professionalRouter.delete("/clients/:clientId", removeClient); //professional removes client from their list

// Below are the functions that encapsulate professional's features
professionalRouter.get("/clients/:clientId/summary", getClientSummary); //same response with /diary/summary endpoint
professionalRouter.get("/clients/:clientId/dashboard", getClientDashboard); //same response with /diary/dashboard endpoint

professionalRouter.post("/clients/:clientId/messages", sendMessage);
professionalRouter.get("/clients/:clientId/messages", listMessages);

professionalRouter.post("/clients/:clientId/shared-recipes", shareRecipe);
professionalRouter.get("/clients/:clientId/shared-recipes", listSharedRecipes);

professionalRouter.post("/clients/:clientId/goals", setGoal);
professionalRouter.get("/clients/:clientId/goals", listGoals);


export default professionalRouter;
