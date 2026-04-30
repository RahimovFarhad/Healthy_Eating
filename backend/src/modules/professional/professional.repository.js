import { prisma } from "../../db/prisma.js";

async function updateRoleToProfessional({ professionalId }) {
    return prisma.user.update({
        where: { userId: professionalId },
        data: { role: "professional" },
    });
}

async function findProfessionalClientLink({ professionalId, clientId }) {
    try {
        const link = await prisma.professionalClient.findUnique({
            where: {
                professionalId_subscriberId: {
                    professionalId: professionalId,
                    subscriberId: clientId,
                },
            },
        });
        return link;
    } catch (error) {
        if (error.code === "P2023") {
            return null; // Professional or subscriber does not exist
        }
    }
}

async function createProfessionalClientLink({ professionalId, subscriberId }) {
    try {
        const result = await prisma.professionalClient.create({
            data: {
                professionalId,
                subscriberId,
                status: "invited",
            },
        }); 
        return result;
    } catch (error) {
        if (error.code === "P2003") {
            return null; // Professional or subscriber does not exist
        }
    }
}

async function listProfessionalClients({ professionalId, includeDetails, status }) {
    return prisma.professionalClient.findMany({
        where: { 
            professionalId,
            status: status || "active",
        },
        orderBy: [{ assignedAt: "desc" }, { id: "desc" }],
        select: {
            id: true,
            subscriberId: true,
            status: true,
            assignedAt: true,
            subscriber: {
                select: {
                    userId: true,
                    fullName: true,
                    email: true,
                    role: true,
                },
            },
            ...(includeDetails
                ? {
                    subscriber: {
                        select: {
                            userId: true,
                            fullName: true,
                            email: true,
                            role: true,
                            clientRiskSnapshots: {
                                orderBy: [{ computedAt: "desc" }, { snapshotId: "desc" }],
                                take: 5,
                                select: {
                                    snapshotId: true,
                                    ruleId: true,
                                    riskLevel: true,
                                    score: true,
                                    reason: true,
                                    computedAt: true,
                                    rule: {
                                        select: {
                                            ruleId: true,
                                            name: true,
                                            severity: true,
                                            nutrient: {
                                                select: {
                                                    nutrientId: true,
                                                    code: true,
                                                    name: true,
                                                    unit: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            nutritionGoalsAsSubscriber: {
                                where: { status: "active" },
                                orderBy: [{ createdAt: "desc" }, { goalId: "desc" }],
                                select: {
                                    goalId: true,
                                    nutrientId: true,
                                    targetMin: true,
                                    targetMax: true,
                                    status: true,
                                    source: true,
                                    startDate: true,
                                    endDate: true,
                                    nutrient: {
                                        select: {
                                            nutrientId: true,
                                            code: true,
                                            name: true,
                                            unit: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                }
                : {}),
        },
    });
}

async function deleteProfessionalClientLink({ professionalId, clientId }) {
    return prisma.professionalClient.delete({
        where: {
            professionalId_subscriberId: {
                professionalId,
                subscriberId: clientId,
            },
        },
    });
}

async function insertMessage({ professionalId, clientId, message }) {
    return prisma.message.create({
        data: {
            professionalId,
            subscriberId: clientId,
            message,
            sentBy: "professional",
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

async function createSharedRecipe({ professionalId, clientId, recipeId }) {
    return prisma.sharedRecipe.create({
        data: {
            professionalId,
            subscriberId: clientId,
            recipeId,
        },
        select: {
            sharedRecipeId: true,
            professionalId: true,
            subscriberId: true,
            recipeId: true,
            createdAt: true,
        },  
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
    updateRoleToProfessional,
    findProfessionalClientLink,
    createProfessionalClientLink,
    listProfessionalClients,
    deleteProfessionalClientLink,
    insertMessage,
    listMessages,
    createSharedRecipe,
    listSharedRecipes
};
