import { getClientDashboardForProfessional, getClientGoalsForProfessional, getClientSummaryForProfessional, getMessagesWithClient, getProfessionalClients, inviteClientToProfessional, removeProfessionalClient, sendMessageToClient, setGoalForClient, setUserAsProfessional } from "./professional.service.js";
import { ProfessionalError } from "./professional.validator.js";

async function setAsProfessional(req, res, next) {
    try {
        const professionalId = req.user?.userId ?? null;
        const professional = await setUserAsProfessional({ professionalId });

        return res.status(200).json({ professional });
    } catch (error) {
        if (error instanceof ProfessionalError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function inviteClient(req, res, next) {
    try {
        const professionalId = req.user?.userId ?? null;
        const invitation = await inviteClientToProfessional({
            professionalId,
            subscriberId: req.body?.subscriberId,
        });

        return res.status(201).json({ invitation });
    } catch (error) {
        if (error instanceof ProfessionalError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function listClients(req, res, next) {
    try {
        const professionalId = req.user?.userId ?? null;
        const clients = await getProfessionalClients({
            professionalId,
            include: req.query?.include,
        });

        return res.status(200).json({ clients });
    } catch (error) {
        if (error instanceof ProfessionalError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function removeClient(req, res, next) {
    try {
        const professionalId = req.user?.userId ?? null;
        const removedClient = await removeProfessionalClient({
            professionalId,
            clientId: Number(req.params?.clientId),
        });

        return res.status(200).json({ removedClient });
    } catch (error) {
        if (error instanceof ProfessionalError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function getClientSummary(req, res, next) {
    try {
        const professionalId = req.user?.userId ?? null;
        const summary = await getClientSummaryForProfessional({
            professionalId,
            clientId: Number(req.params?.clientId),
            period: req.query?.period,
            endDate: req.query?.endDate,
        });

        return res.status(200).json({ summary });
    } catch (error) {
        if (error instanceof ProfessionalError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function getClientDashboard(req, res, next) {
    try {
        const professionalId = req.user?.userId ?? null;
        const dashboardData = await getClientDashboardForProfessional({
            professionalId,
            clientId: Number(req.params?.clientId),
        });

        return res.status(200).json({ dashboardData });
    } catch (error) {
        if (error instanceof ProfessionalError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function sendMessage(req, res, next) {
    try {
        const professionalId = req.user?.userId ?? null;
        const message = await sendMessageToClient({
            professionalId,
            clientId: Number(req.params?.clientId),
            message: req.body?.message,
        });

        return res.status(201).json({ message });
    } catch (error) {
        if (error instanceof ProfessionalError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function listMessages(req, res, next) {
    try {
        const professionalId = req.user?.userId ?? null;
        const messages = await getMessagesWithClient({
            professionalId,
            clientId: Number(req.params?.clientId),
        });

        return res.status(200).json({ messages });
    } catch (error) {
        if (error instanceof ProfessionalError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function setGoal(req, res, next) {
    try {
        const professionalId = req.user?.userId ?? null;
        const createdGoal = await setGoalForClient({
            professionalId,
            clientId: Number(req.params?.clientId),
            goal: req.body?.goal,
        });

        return res.status(201).json({ createdGoal });
    } catch (error) {
        if (error instanceof ProfessionalError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function listGoals(req, res, next) {
    try {
        const professionalId = req.user?.userId ?? null;
        const goals = await getClientGoalsForProfessional({
            professionalId,
            clientId: Number(req.params?.clientId),
        });

        return res.status(200).json({ goals });
    } catch (error) {
        if (error instanceof ProfessionalError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

async function listInvitations(req, res, next) {
    try {
        const professionalId = req.user?.userId ?? null;
        const invitations = await getProfessionalClients({
            professionalId,
            status: "invited",
        });

        return res.status(200).json({ invitations });
    } catch (error) {
        if (error instanceof ProfessionalError) {
            return res.status(400).json({ error: error.message });
        }

        return next(error);
    }
}

export { setAsProfessional, inviteClient, listClients, removeClient, getClientSummary, getClientDashboard, sendMessage, listMessages, setGoal, listGoals, listInvitations };
