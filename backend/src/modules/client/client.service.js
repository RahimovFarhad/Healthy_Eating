/**
 * Client service module
 * Handles business logic for client-professional relationships
 * @module client/service
 */

import {
    acceptProfessionalInvitation,
    disableProfessionalClientLink,
    findProfessionalClientLink,
    insertMessage,
    listClientProfessionals,
    listMessages,
    rejectProfessionalInvitation,
    listSharedRecipes
} from "./client.repository.js";
import {
    ClientError,
    validateClientId,
    validateClientProfessionalInput,
    validateMessageInput,
} from "./client.validator.js";

/**
 * Accepts a professional invitation for a client
 * Validates the invitation exists and is in the correct status before accepting
 * @param {Object} params - The service parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Object>} The updated professional-client link
 * @throws {ClientError} If invitation not found, already active, disabled, or not in invited status
 */
async function acceptInvitationService({ professionalId, clientId }) {
    const validated = validateClientProfessionalInput({ professionalId, clientId });

    const invitation = await findProfessionalClientLink(validated);
    if (!invitation) {
        throw new ClientError("Invitation not found");
    }

    if (invitation.status === "active") {
        throw new ClientError("Invitation already active");
    } 

    if (invitation.status === "disabled") {
        throw new ClientError("Invitation already disabled");
    }

    if (invitation.status !== "invited") {
        throw new ClientError("Invitation is not in invited status");
    }

    return acceptProfessionalInvitation(validated);
}

/**
 * Rejects a professional invitation for a client
 * Validates the invitation exists and is in the correct status before rejecting
 * @param {Object} params - The service parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Object>} The updated professional-client link
 * @throws {ClientError} If invitation not found, already active, disabled, or not in invited status
 */
async function rejectInvitationService({ professionalId, clientId }) {
    const validated = validateClientProfessionalInput({ professionalId, clientId });

    const invitation = await findProfessionalClientLink(validated);
    if (!invitation) {
        throw new ClientError("Invitation not found");
    }

    if (invitation.status === "active") {
        throw new ClientError("Invitation already active");
    } 

    if (invitation.status === "disabled") {
        throw new ClientError("Invitation already disabled");
    }

    if (invitation.status !== "invited") {
        throw new ClientError("Invitation is not in invited status");
    }

    return rejectProfessionalInvitation(validated);
}

/**
 * Lists all professionals associated with a client, filtered by status (by deafult, only active, but can also list invited or disabled)
 * @param {Object} params - The service parameters
 * @param {number} params.clientId - The client's user ID
 * @param {string} [params.status="active"] - The relationship status filter (invited, active, or disabled)
 * @returns {Promise<Array>} Array of professional-client relationships
 * @throws {ClientError} If status value is invalid
 */
async function listProfessionalsService({ clientId, status = "active" }) {
    const validated = validateClientId({ clientId });
    if (status) {
        if (!["invited", "active", "disabled"].includes(status)) {
            throw new ClientError("Invalid status value");
        }
        validated.status = status;
    }
    return listClientProfessionals({ clientId: validated.clientId, status: validated.status });
}

/**
 * Removes a professional from a client's list by disabling the relationship
 * @param {Object} params - The service parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Object>} The updated professional-client link
 * @throws {ClientError} If client is not assigned to the professional
 */
async function removeProfessionalService({ professionalId, clientId }) {
    const validated = validateClientProfessionalInput({ professionalId, clientId });

    await ensureProfessionalClientRelation(validated);

    return disableProfessionalClientLink(validated);
}

/**
 * Sends a message from client to professional
 * @param {Object} params - The service parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @param {string} params.message - The message content
 * @returns {Promise<Object>} The created message object
 * @throws {ClientError} If client is not assigned to the professional
 */
async function sendMessageToProfessional({ professionalId, clientId, message }) {
    const validated = validateMessageInput({ professionalId, clientId, message });

    await ensureProfessionalClientRelation(validated);

    return insertMessage(validated);
}

/**
 * Lists all messages between a client and professional
 * @param {Object} params - The service parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Array>} Array of messages
 * @throws {ClientError} If client is not assigned to the professional
 */
async function listMessagesService({ professionalId, clientId }) {
    const validated = validateClientProfessionalInput({ professionalId, clientId });

    await ensureProfessionalClientRelation(validated);

    return listMessages(validated);
}

/**
 * Ensures an active professional-client relationship exists
 * Helper function to validate relationship before performing operations
 * @param {Object} params - The validation parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Object>} The validated parameters
 * @throws {ClientError} If client is not assigned to the professional or relationship is not active
 */
async function ensureProfessionalClientRelation({ professionalId, clientId }) {
    const validated = validateClientProfessionalInput({ professionalId, clientId });

    const existing = await findProfessionalClientLink(validated);
    if (!existing || existing.status !== "active") {
        throw new ClientError("Client is not assigned to this professional");
    }

    return validated;
}

/**
 * Lists all recipes shared by a professional with a client
 * @param {Object} params - The service parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Array>} Array of shared recipes with recipe details
 * @throws {ClientError} If client is not assigned to the professional
 */
async function listSharedRecipesService({ professionalId, clientId }) {
    const validated = validateClientProfessionalInput({ professionalId, clientId });

    await ensureProfessionalClientRelation(validated);

    return listSharedRecipes(validated);

}

export {
    acceptInvitationService,
    rejectInvitationService,
    listProfessionalsService,
    removeProfessionalService,
    sendMessageToProfessional,
    listMessagesService,
    listSharedRecipesService
};
