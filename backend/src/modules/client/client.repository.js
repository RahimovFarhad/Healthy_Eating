import { prisma } from "../../db/prisma.js";

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

async function listMessages({ professionalId, clientId }) {
    return prisma.message.findMany({
        where: {
            professionalId,
            subscriberId: clientId,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
}

async function listSharedRecipes({ professionalId, clientId }) {
    return prisma.sharedRecipe.findMany({
        where: {
            professionalId,
            subscriberId: clientId,
        },
        orderBy: [{ createdAt: "desc" }, { sharedRecipeId: "desc" }], 
        select: {
            sharedRecipeId: true,
            professionalId: true,
            subscriberId: true,
            recipeId: true,
            createdAt: true,
            recipe: {
                select: {
                    recipeId: true,
                    name: true,
                    description: true,
                    imageUrl: true,
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
