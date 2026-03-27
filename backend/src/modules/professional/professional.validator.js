class ProfessionalError extends Error {
    constructor(message) {
        super(message);
        this.name = "ProfessionalError";
    }
}

function normalizePositiveInteger(value) {
    const parsedValue = typeof value === "string" ? Number(value) : value;

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        return null;
    }

    return parsedValue;
}

function validateProfessionalId({ professionalId }) {
    const normalizedProfessionalId = normalizePositiveInteger(professionalId);
    if (!normalizedProfessionalId) {
        throw new ProfessionalError("Professional ID is required");
    }

    return {
        professionalId: normalizedProfessionalId,
    };
}

function validateClientId({ clientId }) {
    const normalizedClientId = normalizePositiveInteger(clientId);
    if (!normalizedClientId) {
        throw new ProfessionalError("Client ID is required");
    }

    return {
        clientId: normalizedClientId,
    };
}

function validateInviteClientInput({ professionalId, subscriberId }) {
    const normalizedProfessional = validateProfessionalId({ professionalId });
    const normalizedSubscriber = validateClientId({ clientId: subscriberId });

    if (normalizedProfessional.professionalId === normalizedSubscriber.clientId) {
        throw new ProfessionalError("Professional cannot invite themselves");
    }

    return {
        professionalId: normalizedProfessional.professionalId,
        subscriberId: normalizedSubscriber.clientId,
    };
}

function validateRelationshipInput({ professionalId, clientId }) {
    const normalizedProfessional = validateProfessionalId({ professionalId });
    const normalizedClient = validateClientId({ clientId });

    return {
        professionalId: normalizedProfessional.professionalId,
        clientId: normalizedClient.clientId,
    };
}

function validateListClientsInput({ professionalId, include }) {
    const normalizedProfessional = validateProfessionalId({ professionalId });

    if (include !== undefined && include !== "details") {
        throw new ProfessionalError("include must be 'details' when provided");
    }

    return {
        professionalId: normalizedProfessional.professionalId,
        includeDetails: include === "details",
    };
}

function validateSummaryInput({ professionalId, clientId, period, endDate }) {
    const normalizedRelationship = validateRelationshipInput({ professionalId, clientId });

    const validPeriods = new Set(["daily", "weekly", "monthly"]);
    if (!period || !validPeriods.has(period)) {
        throw new ProfessionalError("Period is required and must be one of: daily, weekly, monthly");
    }

    const parsedEndDate = new Date(endDate);
    if (!endDate || Number.isNaN(parsedEndDate.getTime())) {
        throw new ProfessionalError("endDate is required and must be a valid date");
    }

    return {
        professionalId: normalizedRelationship.professionalId,
        clientId: normalizedRelationship.clientId,
        period,
        endDate: parsedEndDate,
    };
}

function validateMessageInput({ professionalId, clientId, message }) {
    const normalizedRelationship = validateRelationshipInput({ professionalId, clientId });

    if (!message || typeof message !== "string" || message.trim() === "") {
        throw new ProfessionalError("message is required");
    }

    return {
        professionalId: normalizedRelationship.professionalId,
        clientId: normalizedRelationship.clientId,
        message: message.trim(),
    };
}

function validateSetGoalInput({ professionalId, clientId, goal }) {
    const normalizedRelationship = validateRelationshipInput({ professionalId, clientId });

    if (!goal || typeof goal !== "object" || Array.isArray(goal)) {
        throw new ProfessionalError("goal is required");
    }

    if (goal.nutrientId !== undefined) {
        const nutrientId = normalizePositiveInteger(goal.nutrientId);
        if (!nutrientId) {
            throw new ProfessionalError("goal.nutrientId must be a positive integer");
        }
    }

    if (goal.nutrientCode !== undefined && typeof goal.nutrientCode !== "string") {
        throw new ProfessionalError("goal.nutrientCode must be a string");
    }

    return {
        professionalId: normalizedRelationship.professionalId,
        clientId: normalizedRelationship.clientId,
        goal,
    };
}

export {
    ProfessionalError,
    validateProfessionalId,
    validateClientId,
    validateInviteClientInput,
    validateRelationshipInput,
    validateListClientsInput,
    validateSummaryInput,
    validateMessageInput,
    validateSetGoalInput,
};
