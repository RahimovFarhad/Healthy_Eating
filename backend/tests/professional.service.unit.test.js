import { expect, jest } from "@jest/globals";
import { ProfessionalError } from "../src/modules/professional/professional.validator.js";

const PROFESSIONAL_ID = 1;
const SUBSCRIBER_ID = 2;

const mockgetDashboardDataForSubscriber = jest.fn();
const mockGetNutritionSummary = jest.fn();

const mockCreateGoalForSubscriber = jest.fn();
const mockGetGoalsService = jest.fn();

const mockCreateProfessionalClientLink = jest.fn();
const mockDeleteProfessionalClientLink = jest.fn();
const mockFindProfessionalClientLink = jest.fn();
const mockInsertMessage = jest.fn();
const mockListMessages = jest.fn();
const mockListProfessionalClients = jest.fn();
const mockUpdateRoleToProfessional = jest.fn();

const mockValidateInviteClientInput = jest.fn();
const mockValidateListClientsInput = jest.fn();
const mockValidateMessageInput = jest.fn();
const mockValidateProfessionalId = jest.fn();
const mockValidateRelationshipInput = jest.fn();
const mockValidateSetGoalInput = jest.fn();
const mockValidateSummaryInput = jest.fn();

jest.unstable_mockModule("../src/modules/diary/diary.service.js", () => ({
  getDashboardDataForSubscriber: mockgetDashboardDataForSubscriber,
  getNutritionSummary: mockGetNutritionSummary,
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
        test("should set a user as a professional when given a valid professionalId", async () => {
            const validRes = {professionalId: PROFESSIONAL_ID};
            mockValidateProfessionalId.mockReturnValue(validRes);
            mockUpdateRoleToProfessional.mockReturnValue({
                userId: PROFESSIONAL_ID,
                role: "Professional"
            });

            const result = await setUserAsProfessional({professionalId: PROFESSIONAL_ID});

            expect(mockValidateProfessionalId).toHaveBeenCalledWith({professionalId: PROFESSIONAL_ID});
            expect(mockUpdateRoleToProfessional).toHaveBeenCalledWith(validRes);
            expect(result).toEqual({
                userId: PROFESSIONAL_ID,
                role: "Professional"
            });
        });
        test("should throw ProfessionalError when given an invalid professionalId", async () => {
            
            try {
                mockValidateProfessionalId.mockImplementation(() => {
                    throw new ProfessionalError("Professional ID is required");
                });
                result = await setUserAsProfessional({professionalId: PROFESSIONAL_ID});
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Professional ID is required");
            }
        });
    });

    describe("inviteClientToProfessional", () => {
        test("should send invitation to the client when given valid professionalId and subscriberId", async () => {
            const validRes = {professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID};
            mockValidateInviteClientInput.mockReturnValue(validRes);
            mockFindProfessionalClientLink.mockReturnValue(null);
            const link = {professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID, status: "active"};
            mockCreateProfessionalClientLink.mockReturnValue(link);

            const result = await inviteClientToProfessional({ professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID });

            expect(mockFindProfessionalClientLink).toHaveBeenCalledWith({
                professionalId: PROFESSIONAL_ID,
                clientId: SUBSCRIBER_ID,
            });
            expect(mockCreateProfessionalClientLink).toHaveBeenCalledWith(validRes);
            expect(result).toEqual(
                link
            )
        });
        test("should throw ProfessionalError when the client is already assigned to the professional", async () => {
            const validRes = {professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID};
            mockValidateInviteClientInput.mockReturnValue(validRes);
            const existingLink = {professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID, status: "active"};
            mockFindProfessionalClientLink.mockReturnValue(existingLink);

            try {
                await inviteClientToProfessional({ professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Client is already assigned to this professional");
            }
        });
        test("should throw ProfessionalError when the client invitation fails", async () => {
            const validRes = {professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID};
            mockValidateInviteClientInput.mockReturnValue(validRes);
            mockFindProfessionalClientLink.mockReturnValue(null);
            mockCreateProfessionalClientLink.mockReturnValue(null);

            try {
                await inviteClientToProfessional({ professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Client invitation failed");
            }
        });
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
