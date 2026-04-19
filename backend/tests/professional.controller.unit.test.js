// tests/professional.controller.unit.test.js
import { afterAll, expect, jest } from "@jest/globals";
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
    test.todo("Returns status code 200 and makes user professional");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Returns 500 on unexpected error");
  });

  describe("inviteClient", () => {
    test.todo("Returns status code 201 and creates invitation on success");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Returns 500 on unexpected error");
  });

  describe("listClients", () => {
    test.todo("Returns status code 200 and lists all clients of the professional on sucess");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Returns 500 on unexpected error");
  });

  describe("removeClient", () => {
    test.todo("Returns status code 200 and removes the client on sucess");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Returns 500 on unexpected error");
  });

  describe("getClientSummary", () => { // in this test file, actual summary function will not be tested, as it is already tested on diary unit tests 
    test.todo("Returns status code 200 and returns client summary on sucess");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Returns 500 on unexpected error");
  });

  describe("getClientDashboard", () => { // in this test file, actual dashboard function will not be tested, as it is already tested on diary unit tests
    test.todo("Returns status code 200 and returns client dashboard on sucess");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Returns 500 on unexpected error");
  });

  describe("sendMessage", () => {
    test.todo("Returns status code 201 and sends message on success"); 
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Returns 500 on unexpected error");
  });

  describe("listMessages", () => {
    test.todo("Returns status code 200 and lists messages between professional and the selected client on success");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Returns 500 on unexpected error");
  });

  describe("setGoal", () => {
    test.todo("Returns status code 201 and creates the goal on sucess");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Returns 500 on unexpected error");
  });

  describe("listGoals", () => {
    test.todo("Returns status code 200 and lists goals of the given client on sucess");
    test.todo("Returns error code 400 when ProfessionalError is thrown");
    test.todo("Returns 500 on unexpected error");
  });
});
