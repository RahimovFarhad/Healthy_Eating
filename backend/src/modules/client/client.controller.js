/**
 * Client controller module
 * Handles HTTP requests for client endpoints
 * @module client/controller
 */

import {
    acceptInvitationService,
    listMessagesService,
    listProfessionalsService,
    rejectInvitationService,
    removeProfessionalService,
    sendMessageToProfessional,
    listSharedRecipesService
} from "./client.service.js";
import { ClientError, getClientErrorStatus } from "./client.validator.js";

/**
 * Handles client accepting a professional invitation
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.professionalId - The professional's user ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The client's user ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with success message or error
 */
async function acceptInvitation(req, res, next) {
    try {
        const { professionalId } = req.params;
        const clientId = req.user?.userId ?? null;
        const accept = await acceptInvitationService({ professionalId, clientId });

        if (accept) {
            return res.status(200).json({ message: "Invitation accepted successfully" });
        } else {
            throw new ClientError("Failed to accept invitation");
        }
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(getClientErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

/**
 * Handles client rejecting a professional invitation
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.professionalId - The professional's user ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The client's user ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with success message or error
 */
async function rejectInvitation(req, res, next) {
    try {
        const { professionalId } = req.params;
        const clientId = req.user?.userId ?? null;
        const reject = await rejectInvitationService({ professionalId, clientId });

        if (reject) {
            return res.status(200).json({ message: "Invitation rejected successfully" });
        } else {
            throw new ClientError("Failed to reject invitation");
        }
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(getClientErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

/**
 * Handles listing all professionals associated with a client
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The client's user ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with array of professionals or error
 */
async function listProfessionals(req, res, next) {
    try {
        const clientId = req.user?.userId ?? null;
        const professionals = await listProfessionalsService({ clientId });

        return res.status(200).json({ professionals });
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(getClientErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

/**
 * Handles removing a professional from a client's list
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.professionalId - The professional's user ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The client's user ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with success message or error
 */
async function removeProfessional(req, res, next) {
    try {
        const { professionalId } = req.params;
        const clientId = req.user?.userId ?? null;
        const remove = await removeProfessionalService({ professionalId, clientId });

        if (remove) {
            return res.status(200).json({ message: "Professional removed successfully" });
        } else {
            throw new ClientError("Failed to remove professional");
        }
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(getClientErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

/**
 * Handles sending a message from client to professional
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.professionalId - The professional's user ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.message - The message content
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The client's user ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with sent message or error
 */
async function sendMessage(req, res, next) {
    try {
        const { professionalId } = req.params;
        const clientId = req.user?.userId ?? null;
        const { message } = req.body;
        const sentMessage = await sendMessageToProfessional({ professionalId, clientId, message });

        return res.status(200).json({ message: "Message sent successfully", sentMessage });
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(getClientErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

/**
 * Handles listing all messages between client and professional
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.professionalId - The professional's user ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The client's user ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with array of messages or error
 */
async function listMessages(req, res, next) {
    try {
        const { professionalId } = req.params;
        const clientId = req.user?.userId ?? null;
        const messages = await listMessagesService({ professionalId, clientId });

        return res.status(200).json({ messages });
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(getClientErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

/**
 * Handles listing all pending invitations for a client
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The client's user ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with array of invitations or error
 */
async function listInvitations(req, res, next) {
    try {
        const clientId = req.user?.userId ?? null;
        const invitations = await listProfessionalsService({ clientId, status: "invited" });

        return res.status(200).json({ invitations });
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(getClientErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

/**
 * Handles listing all recipes shared by a professional with a client
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.professionalId - The professional's user ID
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.userId - The client's user ID
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<Object>} JSON response with array of shared recipes or error
 */
async function listSharedRecipes(req, res, next) {
    try {
        const { professionalId } = req.params;
        const clientId = req.user?.userId ?? null;
        const sharedRecipes = await listSharedRecipesService({ professionalId, clientId });

        return res.status(200).json({ sharedRecipes });
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(getClientErrorStatus(error.message)).json({ error: error.message });
        }

        return next(error);
    }
}

export { acceptInvitation, rejectInvitation, listProfessionals, removeProfessional, sendMessage, listMessages, listInvitations, listSharedRecipes };
