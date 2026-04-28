import { Router } from "express";
import { acceptInvitation, rejectInvitation, listProfessionals, removeProfessional, sendMessage, listMessages, listInvitations } from "./client.controller.js";
const clientRouter = Router();

// needs to do: instead of doing accept/decline by professionalId, we can do it by invitationId, 
// but then we would also need to add GET endpoint for the invitations
clientRouter.post("/client-invitations/:professionalId/accept", acceptInvitation) //client accepts invitation from professional
clientRouter.post("/client-invitations/:professionalId/reject", rejectInvitation) //client rejects invitation from professional
clientRouter.get("/client-invitations", listInvitations) //list of invitations for the currently authenticated client;

clientRouter.get("/professionals", listProfessionals); //list of professionals for the currently authenticated client
clientRouter.delete("/professionals/:professionalId", removeProfessional); //client removes professional from their list

clientRouter.post("/professionals/:professionalId/messages", sendMessage);
clientRouter.get("/professionals/:professionalId/messages", listMessages);

export default clientRouter;
