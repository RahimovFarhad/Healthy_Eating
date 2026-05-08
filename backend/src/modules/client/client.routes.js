/**
 * Client routes module
 * Defines Express routes for client endpoints
 * @module client/routes
 */

import { Router } from "express";
import { acceptInvitation, rejectInvitation, listProfessionals, removeProfessional, sendMessage, listMessages, listInvitations, listSharedRecipes } from "./client.controller.js";

/**
 * Express router for client-related endpoints
 * @type {Router}
 */
const clientRouter = Router();

// needs to do: instead of doing accept/decline by professionalId, we can do it by invitationId,
// but then we would also need to add GET endpoint for the invitations

/**
 * POST /client-invitations/:professionalId/accept - Client accepts invitation from professional
 */
clientRouter.post("/client-invitations/:professionalId/accept", acceptInvitation)

/**
 * POST /client-invitations/:professionalId/reject - Client rejects invitation from professional
 */
clientRouter.post("/client-invitations/:professionalId/reject", rejectInvitation)

/**
 * GET /client-invitations - List of pending invitations for the currently authenticated client
 */
clientRouter.get("/client-invitations", listInvitations)

/**
 * GET /professionals - List of professionals for the currently authenticated client
 */
clientRouter.get("/professionals", listProfessionals);

/**
 * DELETE /professionals/:professionalId - Client removes professional from their list
 */
clientRouter.delete("/professionals/:professionalId", removeProfessional);

/**
 * GET /professionals/:professionalId/shared-recipes - List of recipes shared by the professional to the client
 */
clientRouter.get("/professionals/:professionalId/shared-recipes", listSharedRecipes);

/**
 * POST /professionals/:professionalId/messages - Send a message from client to professional
 */
clientRouter.post("/professionals/:professionalId/messages", sendMessage);

/**
 * GET /professionals/:professionalId/messages - List all messages between client and professional
 */
clientRouter.get("/professionals/:professionalId/messages", listMessages);

export default clientRouter;
