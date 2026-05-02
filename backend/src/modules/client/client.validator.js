import { validateRelationshipInput } from "../professional/professional.validator.js";

class ClientError extends Error {
    constructor(message) {
        super(message);
        this.name = "ClientError";
    }
}

// handles the error status code
function getClientErrorStatus(message) {
    if (message.toLowerCase().includes("not in invited status") || message.toLowerCase().includes("not assigned")) {
        return 403; // forbidden access
    }
    if (message.toLowerCase().includes("not found")) {
        return 404; // not found
    }
    if (message.toLowerCase().includes("already active") || message.toLowerCase().includes("already disabled")) {
        return 409; // conflict 
    }
    return 400; // bad request - for otherwise and general error cases
}

function normalizePositiveInteger(value) {
    const parsedValue = typeof value === "string" ? Number(value) : value;

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        return null;
    }

    return parsedValue;
}

function validateClientId({ clientId }) {
    const normalizedClientId = normalizePositiveInteger(clientId);

    if (!normalizedClientId) {
        throw new ClientError("Client ID is required");
    }

    return { clientId: normalizedClientId };
}

function validateProfessionalId({ professionalId }) {
    const normalizedProfessionalId = normalizePositiveInteger(professionalId);

    if (!normalizedProfessionalId) {
        throw new ClientError("Professional ID is required");
    }

    return { professionalId: normalizedProfessionalId };
}

function validateClientProfessionalInput({ professionalId, clientId }) {
    const normalizedClient = validateClientId({ clientId });
    const normalizedProfessional = validateProfessionalId({ professionalId });

    return {
        clientId: normalizedClient.clientId,
        professionalId: normalizedProfessional.professionalId,
    };
}

function validateMessageInput({ professionalId, clientId, message }) {
    const normalizedRelationship = validateRelationshipInput({ professionalId, clientId });

    if (!message || typeof message !== "string" || message.trim() === "") {
        throw new ClientError("message is required");
    }

    return {
        professionalId: normalizedRelationship.professionalId,
        clientId: normalizedRelationship.clientId,
        message: message.trim(),
    };
}

export {
    ClientError,
    getClientErrorStatus,
    validateClientId,
    validateProfessionalId,
    validateClientProfessionalInput,
    validateMessageInput
};
