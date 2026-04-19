// tests/professional.controller.unit.test.js
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
    test.todo("Returns status code 200 and removes the client on sucess");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Passes to next on unknown error");
  });

  describe("getClientSummary", () => { // in this test file, actual summary function will not be tested, as it is already tested on diary unit tests 
    test.todo("Returns status code 200 and returns client summary on sucess");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Passes to next on unknown error");
  });

  describe("getClientDashboard", () => { // in this test file, actual dashboard function will not be tested, as it is already tested on diary unit tests
    test.todo("Returns status code 200 and returns client dashboard on sucess");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Passes to next on unknown error");
  });

  describe("sendMessage", () => {
    test.todo("Returns status code 201 and sends message on success"); 
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Passes to next on unknown error");
  });

  describe("listMessages", () => {
    test.todo("Returns status code 200 and lists messages between professional and the selected client on success");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Passes to next on unknown error");
  });

  describe("setGoal", () => {
    test.todo("Returns status code 201 and creates the goal on sucess");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Passes to next on unknown error");
  });

  describe("listGoals", () => {
    test.todo("Returns status code 200 and lists goals of the given client on sucess");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Passes to next on unknown error");
  });
});
