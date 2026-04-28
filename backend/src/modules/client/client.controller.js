import {
    acceptInvitationService,
    listMessagesService,
    listProfessionalsService,
    rejectInvitationService,
    removeProfessionalService,
    sendMessageToProfessional,
} from "./client.service.js";
import { ClientError } from "./client.validator.js";

async function acceptInvitation(req, res, next) {
    try {
        const { professionalId } = req.params;
        const clientId = req.user?.userId ?? null;
        const accept = await acceptInvitationService({ professionalId, clientId });

        if (accept) {
            return res.status(200).json({ message: "Invitation accepted successfully" });
        } else {
            return res.status(400).json({ error: "Failed to accept invitation" });
        }
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function rejectInvitation(req, res, next) {
    try {
        const { professionalId } = req.params;
        const clientId = req.user?.userId ?? null;
        const reject = await rejectInvitationService({ professionalId, clientId });

        if (reject) {
            return res.status(200).json({ message: "Invitation rejected successfully" });
        } else {
            throw new ClientError("Failed to reject invitation");
        }
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function listProfessionals(req, res, next) {
    try {
        const clientId = req.user?.userId ?? null;
        const professionals = await listProfessionalsService({ clientId });
        return res.status(200).json({ professionals });
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function removeProfessional(req, res, next) {
    try {
        const { professionalId } = req.params;
        const clientId = req.user?.userId ?? null;
        const remove = await removeProfessionalService({ professionalId, clientId });

        if (remove) {
            return res.status(200).json({ message: "Professional removed successfully" });
        } else {
            throw new ClientError("Failed to remove professional");
        }
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function sendMessage(req, res, next) {
    try {
        const { professionalId } = req.params;
        const clientId = req.user?.userId ?? null;
        const { message } = req.body;
        const sentMessage = await sendMessageToProfessional({ professionalId, clientId, message });

        return res.status(200).json({ message: "Message sent successfully", sentMessage });
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function listMessages(req, res, next) {
    try {
        const { professionalId } = req.params;
        const clientId = req.user?.userId ?? null;
        const messages = await listMessagesService({ professionalId, clientId });

        return res.status(200).json({ messages });
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function listInvitations(req, res, next) {
    try {
        const clientId = req.user?.userId ?? null;
        const invitations = await listProfessionalsService({ clientId, status: "invited" });
        return res.status(200).json({ invitations });
    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}


export { acceptInvitation, rejectInvitation, listProfessionals, removeProfessional, sendMessage, listMessages, listInvitations };
