class ClientError extends Error {
    constructor(message) {
        super(message);
        this.name = "ClientError";
    }
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
    const normalizedRelationship = validateClientProfessionalInput({ professionalId, clientId });

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
    validateClientId,
    validateProfessionalId,
    validateClientProfessionalInput,
    validateMessageInput,
    ClientError,
};
