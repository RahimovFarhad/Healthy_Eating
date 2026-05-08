/**
 * Client repository module
 * Handles database operations for client-professional relationships
 * @module client/repository
 */

import { prisma } from "../../db/prisma.js";

/**
 * Finds a professional-client relationship link in the database
 * @param {Object} params - The search parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Object|null>} The professional-client link or null if not found
 */
async function findProfessionalClientLink({ professionalId, clientId }) {
    return prisma.professionalClient.findUnique({
        where: {
            professionalId_subscriberId: {
                professionalId,
                subscriberId: clientId,
            },
        },
    });
}

/**
 * Accepts a professional invitation by updating the status to active
 * @param {Object} params - The update parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Object>} The updated professional-client link
 */
async function acceptProfessionalInvitation({ professionalId, clientId }) {
    return prisma.professionalClient.update({
        where: {
            professionalId_subscriberId: {
                professionalId,
                subscriberId: clientId,
            },
        },
        data: {
            status: "active",
        },
    });
}

/**
 * Rejects a professional invitation by updating the status to disabled
 * @param {Object} params - The update parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Object>} The updated professional-client link
 */
async function rejectProfessionalInvitation({ professionalId, clientId }) {
    return prisma.professionalClient.update({
        where: {
            professionalId_subscriberId: {
                professionalId,
                subscriberId: clientId,
            },
        },
        data: {
            status: "disabled",
        },
    });
}

/**
 * Lists all professionals associated with a client, filtered by status
 * @param {Object} params - The query parameters
 * @param {number} params.clientId - The client's user ID
 * @param {string} params.status - The relationship status (invited, active, or disabled)
 * @returns {Promise<Array>} Array of professional-client relationships with professional details
 */
async function listClientProfessionals({ clientId, status }) {
    return prisma.professionalClient.findMany({
        where: {
            subscriberId: clientId,
            status: status,
        },
        orderBy: [{ assignedAt: "desc" }, { id: "desc" }],
        select: {
            id: true,
            professionalId: true,
            status: true,
            assignedAt: true,
            professional: {
                select: {
                    userId: true,
                    fullName: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
}

/**
 * Disables a professional-client relationship by setting status to disabled
 * @param {Object} params - The update parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Object>} The updated professional-client link
 */
async function disableProfessionalClientLink({ professionalId, clientId }) {
    return prisma.professionalClient.update({
        where: {
            professionalId_subscriberId: {
                professionalId,
                subscriberId: clientId,
            },
        },
        data: {
            status: "disabled",
        },
    });
}

/**
 * Inserts a new message from client to professional
 * @param {Object} params - The message parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @param {string} params.message - The message content
 * @returns {Promise<Object>} The created message object
 */
async function insertMessage({ professionalId, clientId, message }) {
    return prisma.message.create({
        data: {
            professionalId,
            subscriberId: clientId,
            message,
            sentBy: "subscriber",
        },
    });
}

/**
 * Lists all messages between a professional and client
 * @param {Object} params - The query parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Array>} Array of messages ordered by creation date (newest first)
 */
async function listMessages({ professionalId, clientId }) {
    return prisma.message.findMany({
        where: {
            professionalId,
            subscriberId: clientId,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
}

/**
 * Lists all recipes shared by a professional with a client
 * @param {Object} params - The query parameters
 * @param {number} params.professionalId - The professional's user ID
 * @param {number} params.clientId - The client's user ID
 * @returns {Promise<Array>} Array of shared recipes with recipe details
 */
async function listSharedRecipes({ professionalId, clientId }) {
    return prisma.recipeShare.findMany({
        where: {
            professionalId,
            subscriberId: clientId,
        },
        orderBy: [{ sharedAt: "desc" }, { id: "desc" }],
        select: {
            id: true,
            professionalId: true,
            subscriberId: true,
            recipeId: true,
            sharedAt: true,
            recipe: {
                select: {
                    recipeId: true,
                    title: true,
                    image: true,
                },
            },
        },
    });
}

export {
    findProfessionalClientLink,
    acceptProfessionalInvitation,
    rejectProfessionalInvitation,
    listClientProfessionals,
    disableProfessionalClientLink,
    insertMessage,
    listMessages,
    listSharedRecipes
};
