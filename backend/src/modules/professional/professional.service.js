import { getDashboardDataForSubscriber, getNutritionSummary } from "../diary/diary.service.js";
import { createGoalForSubscriber, getGoalsService } from "../goals/goals.service.js";
import { createProfessionalClientLink, deleteProfessionalClientLink, findProfessionalClientLink, insertAdviceMessage, listAdviceMessages, listProfessionalClients, updateRoleToProfessional } from "./professional.repository.js";
import { ProfessionalError, validateInviteClientInput, validateListClientsInput, validateMessageInput, validateProfessionalId, validateRelationshipInput, validateSetGoalInput, validateSummaryInput } from "./professional.validator.js";

async function setUserAsProfessional({ professionalId }) {
    const validated = validateProfessionalId({ professionalId });

    return updateRoleToProfessional(validated);
}

async function inviteClientToProfessional({ professionalId, subscriberId }) {
    const validated = validateInviteClientInput({ professionalId, subscriberId });

    const existing = await findProfessionalClientLink({
        professionalId: validated.professionalId,
        clientId: validated.subscriberId,
    });

    if (existing && existing.status !== "disabled") {
        throw new ProfessionalError("Client is already assigned to this professional");
    }

    return createProfessionalClientLink(validated);
}

async function getProfessionalClients({ professionalId, include }) {
    const validated = validateListClientsInput({ professionalId, include });

    return listProfessionalClients({
        professionalId: validated.professionalId,
        includeDetails: validated.includeDetails,
    });
}

async function removeProfessionalClient({ professionalId, clientId }) {
    const validated = validateRelationshipInput({ professionalId, clientId });

    const existing = await findProfessionalClientLink(validated);
    if (!existing || existing.status === "disabled") {
        throw new ProfessionalError("Client relationship not found");
    }

    return deleteProfessionalClientLink(validated);
}

async function ensureProfessionalClientRelation({ professionalId, clientId }) {
    const validated = validateRelationshipInput({ professionalId, clientId });

    const existing = await findProfessionalClientLink(validated);
    if (!existing || existing.status !== "active") {
        throw new ProfessionalError("Client is not assigned to this professional");
    }

    return validated;
}

async function getClientSummaryForProfessional({ professionalId, clientId, period, endDate }) {
    const validated = validateSummaryInput({ professionalId, clientId, period, endDate });

    await ensureProfessionalClientRelation({
        professionalId: validated.professionalId,
        clientId: validated.clientId,
    });

    return getNutritionSummary({
        subscriberId: validated.clientId,
        period: validated.period,
        endDate: validated.endDate,
    });
}

async function getClientDashboardForProfessional({ professionalId, clientId }) {
    const validated = validateRelationshipInput({ professionalId, clientId });

    await ensureProfessionalClientRelation(validated);

    return getDashboardDataForSubscriber({
        subscriberId: validated.clientId,
    });
}

async function sendMessageToClient({ professionalId, clientId, message }) {
    const validated = validateMessageInput({ professionalId, clientId, message });

    await ensureProfessionalClientRelation({
        professionalId: validated.professionalId,
        clientId: validated.clientId,
    });

    return insertAdviceMessage(validated);
}

async function getMessagesWithClient({ professionalId, clientId }) {
    const validated = validateRelationshipInput({ professionalId, clientId });

    await ensureProfessionalClientRelation(validated);

    return listAdviceMessages(validated);
}

async function setGoalForClient({ professionalId, clientId, goal }) {
    const validated = validateSetGoalInput({ professionalId, clientId, goal });

    await ensureProfessionalClientRelation({
        professionalId: validated.professionalId,
        clientId: validated.clientId,
    });

    return createGoalForSubscriber({
        subscriberId: validated.clientId,
        goal: validated.goal,
        options: {
            forcedSource: "professional_defined",
            forcedStatus: "active",
            forcedSetByProfessionalId: validated.professionalId,
        },
    });
}

async function getClientGoalsForProfessional({ professionalId, clientId }) {
    const validated = validateRelationshipInput({ professionalId, clientId });

    await ensureProfessionalClientRelation(validated);

    return getGoalsService({ subscriberId: validated.clientId, effective: true });
}

export {
    setUserAsProfessional,
    inviteClientToProfessional,
    getProfessionalClients,
    removeProfessionalClient,
    getClientSummaryForProfessional,
    getClientDashboardForProfessional,
    sendMessageToClient,
    getMessagesWithClient,
    setGoalForClient,
    getClientGoalsForProfessional,
};
