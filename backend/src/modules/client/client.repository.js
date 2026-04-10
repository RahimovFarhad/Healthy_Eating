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

async function listClientProfessionals({ clientId }) {
    return prisma.professionalClient.findMany({
        where: {
            subscriberId: clientId,
            status: "active",
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

export {
    findProfessionalClientLink,
    acceptProfessionalInvitation,
    rejectProfessionalInvitation,
    listClientProfessionals,
    disableProfessionalClientLink,
    insertMessage,
    listMessages,
};
