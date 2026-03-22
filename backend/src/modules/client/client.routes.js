import { Router } from "express";
const clientRouter = Router();

clientRouter.post("/client-invitations/:invitationId/accept", acceptInvitation) //client accepts invitation from professional
clientRouter.post("/client-invitations/:invitationId/reject", rejectInvitation) //client rejects invitation from professional

clientRouter.get("/professionals", listProfessionals); //list of professionals for the currently authenticated client
clientRouter.delete("/professionals/:professionalId", removeProfessional); //client removes professional from their list

clientRouter.post("/professionals/:professionalId/messages", sendMessage);
clientRouter.get("/professionals/:professionalId/messages", listMessages);

export default clientRouter;
