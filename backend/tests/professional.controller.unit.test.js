import { expect, jest } from "@jest/globals";
import { ProfessionalError } from "../src/modules/professional/professional.validator.js";

const TEST_PROFESSIONAL_ID = 1; 
const TEST_CLIENT_ID = 2;

// Mocking service layer
const mockSetUserAsProfessional = jest.fn();
const mockInviteClientToProfessional = jest.fn();
const mockGetProfessionalClients = jest.fn();
const mockRemoveProfessionalClient = jest.fn();
const mockGetClientSummaryForProfessional = jest.fn();
const mockGetClientDashboardForProfessional = jest.fn();
const mockSendMessageToClient = jest.fn();
const mockGetMessagesWithClient = jest.fn();
const mockSetGoalForClient = jest.fn();
const mockGetClientGoalsForProfessional = jest.fn();

const mockGetSharedRecipes = jest.fn();
const mockShareRecipeWithClient = jest.fn();

jest.unstable_mockModule("../src/modules/professional/professional.service.js", () => ({
  setUserAsProfessional: mockSetUserAsProfessional,
  inviteClientToProfessional: mockInviteClientToProfessional,
  getProfessionalClients: mockGetProfessionalClients,
  removeProfessionalClient: mockRemoveProfessionalClient,
  getClientSummaryForProfessional: mockGetClientSummaryForProfessional,
  getClientDashboardForProfessional: mockGetClientDashboardForProfessional,
  sendMessageToClient: mockSendMessageToClient,
  getMessagesWithClient: mockGetMessagesWithClient,
  setGoalForClient: mockSetGoalForClient,
  getClientGoalsForProfessional: mockGetClientGoalsForProfessional,
  getSharedRecipes: mockGetSharedRecipes,
  shareRecipeWithClient: mockShareRecipeWithClient,
}));

const {
  setAsProfessional,
  inviteClient,
  listClients,
  removeClient,
  getClientSummary,
  getClientDashboard,
  sendMessage,
  listMessages,
  setGoal,
  listGoals,
} = await import("../src/modules/professional/professional.controller.js");

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Professional Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setAsProfessional", () => {
    test("Returns status code 200 and makes user professional", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID } };
      const res = createRes();
      const next = jest.fn();

      mockSetUserAsProfessional.mockResolvedValue(true);
      await setAsProfessional(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockSetUserAsProfessional).toHaveBeenCalledWith({ professionalId: TEST_PROFESSIONAL_ID });
      expect(res.json).toHaveBeenCalledWith({ professional: true });
    });
    test("Returns error code 400 when ProfessionalError is thrown", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID } };
      const res = createRes();
      const next = jest.fn();

      mockSetUserAsProfessional.mockRejectedValue(new ProfessionalError("Invalid professional ID"));
      await setAsProfessional(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid professional ID" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Passes to next on unknown error", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID } };
      const res = createRes();
      const next = jest.fn();

      mockSetUserAsProfessional.mockRejectedValue(new Error("Unexpected error"));
      await setAsProfessional(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalledWith();
    });
  });

  describe("inviteClient", () => {
    test("Returns status code 201 and creates invitation on success", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, body: { subscriberId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockInviteClientToProfessional.mockResolvedValue({ invitationId: 123 });
      await inviteClient(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockInviteClientToProfessional).toHaveBeenCalledWith({ professionalId: TEST_PROFESSIONAL_ID, subscriberId: TEST_CLIENT_ID });
      expect(res.json).toHaveBeenCalledWith({ invitation: { invitationId: 123 } });
    });
    test("Returns error code 400 when ProfessionalError is thrown", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, body: { subscriberId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockInviteClientToProfessional.mockRejectedValue(new ProfessionalError("Invalid client ID"));
      await inviteClient(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid client ID" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Passes to next on unknown error", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, body: { subscriberId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockInviteClientToProfessional.mockRejectedValue(new Error("Unexpected error"));
      await inviteClient(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalledWith();
    });
  });

  describe("listClients", () => {
    test("Returns status code 200 and lists all clients of the professional on sucess", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, query: { include: "details" } };
      const res = createRes();
      const next = jest.fn();

      const clients = [{ clientId: TEST_CLIENT_ID, name: "Client A" }];
      mockGetProfessionalClients.mockResolvedValue(clients);
      await listClients(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockGetProfessionalClients).toHaveBeenCalledWith({ professionalId: TEST_PROFESSIONAL_ID, include: "details" });
      expect(res.json).toHaveBeenCalledWith({ clients });

    });
    test("Returns error code 400 when ProfessionalError is thrown", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, query: { include: "details" } };
      const res = createRes();
      const next = jest.fn();

      mockGetProfessionalClients.mockRejectedValue(new ProfessionalError("Invalid professional ID"));
      await listClients(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid professional ID" });
      expect(next).not.toHaveBeenCalledWith();
    });

    test("Passes to next on unknown error", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, query: { include: "details" } };
      const res = createRes();
      const next = jest.fn();

      mockGetProfessionalClients.mockRejectedValue(new Error("Unexpected error"));
      await listClients(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalledWith();
    });
  });

  describe("removeClient", () => {
    test("Returns status code 200 and removes the client on sucess", async () => {;
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      const removedClient = { id: 1, professionalId: TEST_PROFESSIONAL_ID, subscriberId: TEST_CLIENT_ID, status: "disabled" };
      mockRemoveProfessionalClient.mockResolvedValue(removedClient);
      await removeClient(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockRemoveProfessionalClient).toHaveBeenCalledWith({ professionalId: TEST_PROFESSIONAL_ID, clientId: TEST_CLIENT_ID });
      expect(res.json).toHaveBeenCalledWith({ removedClient });
    });
    test("Returns error code 400 when ProfessionalError is thrown", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockRemoveProfessionalClient.mockRejectedValue(new ProfessionalError("Invalid professional ID"));
      await removeClient(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid professional ID" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Passes to next on unknown error", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockRemoveProfessionalClient.mockRejectedValue(new Error("Unexpected error"));
      await removeClient(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalledWith();
    });
  });

  describe("getClientSummary", () => { // in this test file, actual summary function will not be tested, as it is already tested on diary unit tests 
    test("Returns status code 200 and returns client summary on sucess", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      const summary = { calories: 2000, protein: 150, carbs: 250, fats: 70 };
      mockGetClientSummaryForProfessional.mockResolvedValue(summary);
      await getClientSummary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockGetClientSummaryForProfessional).toHaveBeenCalledWith({ professionalId: TEST_PROFESSIONAL_ID, clientId: TEST_CLIENT_ID });
      expect(res.json).toHaveBeenCalledWith({ summary });
    });
    test("Returns error code 400 when ProfessionalError is thrown", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockGetClientSummaryForProfessional.mockRejectedValue(new ProfessionalError("Invalid professional ID"));
      await getClientSummary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid professional ID" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Passes to next on unknown error", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockGetClientSummaryForProfessional.mockRejectedValue(new Error("Unexpected error"));
      await getClientSummary(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalledWith();
    });
  });

  describe("getClientDashboard", () => { // in this test file, actual dashboard function will not be tested, as it is already tested on diary unit tests
    test("Returns status code 200 and returns client dashboard on sucess", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      const dashboardData = { weightTrend: "stable", calorieIntakeTrend: "increasing" };
      mockGetClientDashboardForProfessional.mockResolvedValue(dashboardData);
      await getClientDashboard(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockGetClientDashboardForProfessional).toHaveBeenCalledWith({ professionalId: TEST_PROFESSIONAL_ID, clientId: TEST_CLIENT_ID });
      expect(res.json).toHaveBeenCalledWith({ dashboardData });
    });
    test("Returns error code 400 when ProfessionalError is thrown", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockGetClientDashboardForProfessional.mockRejectedValue(new ProfessionalError("Invalid professional ID"));
      await getClientDashboard(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid professional ID" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Passes to next on unknown error", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockGetClientDashboardForProfessional.mockRejectedValue(new Error("Unexpected error"));
      await getClientDashboard(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalledWith();
    });
  });

  describe("sendMessage", () => {
    test("Returns status code 201 and sends message on success", async () => {
      const messageText = "Hello, client!";
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID }, body: { message: messageText } };
      const res = createRes();
      const next = jest.fn();

      const message = { id: 1, text: messageText, sender: "professional", timestamp: new Date() };
      mockSendMessageToClient.mockResolvedValue(message);
      await sendMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockSendMessageToClient).toHaveBeenCalledWith({ professionalId: TEST_PROFESSIONAL_ID, clientId: TEST_CLIENT_ID, message: messageText });
      expect(res.json).toHaveBeenCalledWith({ message });
    });
    test("Returns error code 400 when ProfessionalError is thrown", async () => {
      const messageText = "Hello, client!";
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID }, body: { message: messageText } };
      const res = createRes();
      const next = jest.fn();

      mockSendMessageToClient.mockRejectedValue(new ProfessionalError("Invalid professional ID"));
      await sendMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid professional ID" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Passes to next on unknown error", async () => {
      const messageText = "Hello, client!";
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID }, body: { message: messageText } };
      const res = createRes();
      const next = jest.fn();

      mockSendMessageToClient.mockRejectedValue(new Error("Unexpected error"));
      await sendMessage(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalledWith();
    });
  });

  describe("listMessages", () => {
    test("Returns status code 200 and lists messages between professional and the selected client on success", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      const messages = [{ id: 1, text: "Hello, client!" }];
      mockGetMessagesWithClient.mockResolvedValue(messages);
      await listMessages(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockGetMessagesWithClient).toHaveBeenCalledWith({ professionalId: TEST_PROFESSIONAL_ID, clientId: TEST_CLIENT_ID });
      expect(res.json).toHaveBeenCalledWith({ messages });
    });
    test("Returns error code 400 when ProfessionalError is thrown", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockGetMessagesWithClient.mockRejectedValue(new ProfessionalError("Invalid professional ID"));
      await listMessages(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid professional ID" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Passes to next on unknown error", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockGetMessagesWithClient.mockRejectedValue(new Error("Unexpected error"));
      await listMessages(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalledWith();
    });
  });

  describe("setGoal", () => {
    test("Returns status code 201 and creates the goal on success", async () => {
      const goalObject = { nutritionId: 1, targetValue: 2000 };
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID }, body: {goal: goalObject} };
      const res = createRes();
      const next = jest.fn();

      const goal = { id: 1, nutritionId: 1, targetValue: 2000 };
      mockSetGoalForClient.mockResolvedValue(goal);
      await setGoal(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockSetGoalForClient).toHaveBeenCalledWith({ professionalId: TEST_PROFESSIONAL_ID, clientId: TEST_CLIENT_ID, goal: goalObject });
      expect(res.json).toHaveBeenCalledWith({ createdGoal: goal });
    });
    test("Returns error code 400 when ProfessionalError is thrown", async () => {
      const goalObject = { nutritionId: 1, targetValue: 2000 };
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID }, body: {goal: goalObject} };
      const res = createRes();
      const next = jest.fn();

      mockSetGoalForClient.mockRejectedValue(new ProfessionalError("Invalid professional ID"));
      await setGoal(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid professional ID" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Passes to next on unknown error", async () => {
      const goalObject = { nutritionId: 1, targetValue: 2000 };
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID }, body: {goal: goalObject} };
      const res = createRes();
      const next = jest.fn();

      mockSetGoalForClient.mockRejectedValue(new Error("Unexpected error"));
      await setGoal(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalledWith();
    });
  });

  describe("listGoals", () => {
    test("Returns status code 200 and lists goals of the given client on sucess", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      const goals = [{ id: 1, nutritionId: 1, targetValue: 2000 }];
      mockGetClientGoalsForProfessional.mockResolvedValue(goals);
      await listGoals(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockGetClientGoalsForProfessional).toHaveBeenCalledWith({ professionalId: TEST_PROFESSIONAL_ID, clientId: TEST_CLIENT_ID });
      expect(res.json).toHaveBeenCalledWith({ goals });
    });
    test("Returns error code 400 when ProfessionalError is thrown", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockGetClientGoalsForProfessional.mockRejectedValue(new ProfessionalError("Invalid professional ID"));
      await listGoals(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid professional ID" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Passes to next on unknown error", async () => {
      const req = { user: { userId: TEST_PROFESSIONAL_ID }, params: { clientId: TEST_CLIENT_ID } };
      const res = createRes();
      const next = jest.fn();

      mockGetClientGoalsForProfessional.mockRejectedValue(new Error("Unexpected error"));
      await listGoals(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalledWith();
    });
  });
});
