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

async function removeProfessionalService({ professionalId, clientId }) {
    const validated = validateClientProfessionalInput({ professionalId, clientId });

    await ensureProfessionalClientRelation(validated);

    return disableProfessionalClientLink(validated);
}

async function sendMessageToProfessional({ professionalId, clientId, message }) {
    const validated = validateMessageInput({ professionalId, clientId, message });

    await ensureProfessionalClientRelation(validated);

    return insertMessage(validated);
}

async function listMessagesService({ professionalId, clientId }) {
    const validated = validateClientProfessionalInput({ professionalId, clientId });

    await ensureProfessionalClientRelation(validated);

    return listMessages(validated);
}

async function ensureProfessionalClientRelation({ professionalId, clientId }) {
    const validated = validateClientProfessionalInput({ professionalId, clientId });

    const existing = await findProfessionalClientLink(validated);
    if (!existing || existing.status !== "active") {
        throw new ClientError("Client is not assigned to this professional");
    }

    return validated;
}

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
