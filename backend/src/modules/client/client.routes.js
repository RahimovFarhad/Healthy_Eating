import { Router } from "express";
import { acceptInvitation, rejectInvitation, listProfessionals, removeProfessional, sendMessage, listMessages } from "./client.controller.js";
const clientRouter = Router();

clientRouter.post("/client-invitations/:professionalId/accept", acceptInvitation) //client accepts invitation from professional
clientRouter.post("/client-invitations/:professionalId/reject", rejectInvitation) //client rejects invitation from professional

clientRouter.get("/professionals", listProfessionals); //list of professionals for the currently authenticated client
clientRouter.delete("/professionals/:professionalId", removeProfessional); //client removes professional from their list

clientRouter.post("/professionals/:professionalId/messages", sendMessage);
clientRouter.get("/professionals/:professionalId/messages", listMessages);

export default clientRouter;
