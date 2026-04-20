import { expect, jest } from "@jest/globals";
import { ProfessionalError } from "../src/modules/professional/professional.validator.js";
import { before, describe } from "node:test";

mockgetDashboardDataForSubscriber = jest.fn();
mockGetNutritionSummary = jest.fn();
mockCreateGoalForSubscriber = jest.fn();
mockGetGoalsService = jest.fn();
mockCreateProfessionalClientLink = jest.fn();
mockDeleteProfessionalClientLink = jest.fn();
mockFindProfessionalClientLink = jest.fn();
mockInsertMessage = jest.fn();
mockListMessages = jest.fn();
mockListProfessionalClients = jest.fn();
mockUpdateRoleToProfessional = jest.fn();
mockValidateInviteClientInput = jest.fn();
mockValidateListClientsInput = jest.fn();
mockValidateMessageInput = jest.fn();
mockValidateProfessionalId = jest.fn();
mockValidateRelationshipInput = jest.fn();
mockValidateSetGoalInput = jest.fn();
mockValidateSummaryInput = jest.fn();

jest.unstable_mockModule("../src/modules/diary/diary.service.js", () => ({
  getClientDashboardForProfessional: mockgetDashboardDataForSubscriber,
  getClientSummaryForProfessional: mockGetNutritionSummary,
}));

jest.unstable_mockModule("../src/modules/goals/goals.service.js", () => ({
  createGoalForSubscriber: mockCreateGoalForSubscriber,
  getGoalsService: mockGetGoalsService,
}));

jest.unstable_mockModule("../src/modules/professional/professional.repository.js", () => ({
  createProfessionalClientLink: mockCreateProfessionalClientLink,
  deleteProfessionalClientLink: mockDeleteProfessionalClientLink,
  findProfessionalClientLink: mockFindProfessionalClientLink,
  insertMessage: mockInsertMessage,
  listMessages: mockListMessages,
  listProfessionalClients: mockListProfessionalClients,
  updateRoleToProfessional: mockUpdateRoleToProfessional,
}));

jest.unstable_mockModule("../src/modules/professional/professional.validator.js", () => ({
  ProfessionalError: ProfessionalError,
  validateInviteClientInput: mockValidateInviteClientInput,
  validateListClientsInput: mockValidateListClientsInput,
  validateMessageInput: mockValidateMessageInput,
  validateProfessionalId: mockValidateProfessionalId,
  validateRelationshipInput: mockValidateRelationshipInput,
  validateSetGoalInput: mockValidateSetGoalInput,
  validateSummaryInput: mockValidateSummaryInput,
}));

const {
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
    ensureProfessionalClientRelation
} = await import("../src/modules/professional/professional.service.js");

// now adding to dos
describe("Professional Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("setUserAsProfessional", () => {
        test.todo("should set a user as a professional when given a valid professionalId");
        test.todo("should throw ProfessionalError when given an invalid professionalId");
    });

    describe("inviteClientToProfessional", () => {
        test.todo("should send invitation to the client when given valid professionalId and subscriberId");
        test.todo("should throw ProfessionalError when the client is already assigned to the professional");
        test.todo("should throw ProfessionalError when the client invitation fails");
    });

    describe("getProfessionalClients", () => {
        test.todo("should return list of clients assigned to the professional when given a valid professionalId");
        test.todo("should throw ProfessionalError if given an invalid professionalId");
    });

    describe("removeProfessionalClient", () => {
        test.todo("should remove the client from professional if valid professionalId and clientId is provided");
        test.todo("should throw ProfessionalError if a valid relationship is not found");
    });

    describe("getClientSummaryForProfessional", () => {
        test.todo("should return the client summary when given valid professionalId and clientId");
        test.todo("should throw ProfessionalError if professionalId or clientId is invalid");
    });

    describe("getClientDashboardForProfessional", () => {
        test.todo("should return the client dashboard when given valid professionalId and clientId");
        test.todo("should throw ProfessionalError if professionalId or clientId is invalid");
    });

    describe("sendMessageToClient", () => {
        test.todo("should send a message to the client when given valid professionalId, clientId and message");
        test.todo("should throw ProfessionalError if professionalId, clientId or message is invalid");
    });

    describe("getMessagesWithClient", () => {
        test.todo("should return the list of messages between professional and client when given valid professionalId and clientId");
        test.todo("should throw ProfessionalError if professionalId or clientId is invalid");
    });

    describe("setGoalForClient", () => {
        test.todo("should set a goal for the client when given valid professionalId, clientId and goal data");
        test.todo("should throw ProfessionalError if professionalId, clientId or goal data is invalid");
    });

    describe("getClientGoalsForProfessional", () => {
        test.todo("should return list of goals for the client when given valid professionalId and clientId");
        test.todo("should throw ProfessionalError if professionalId or clientId is invalid");
    });

    describe("ensureProfessionalClientRelation", () => {
        test.todo("should not throw an error if a valid professional-client relationship exists");
        test.todo("should throw ProfessionalError if no relationship exists");
        test.todo("should throw ProfessionalError if the relationship exists but is not active");
        test.todo("should throw ProfessionalError if professionalId or clientId is invalid");
    });

});
