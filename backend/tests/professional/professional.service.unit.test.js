import { expect, jest } from "@jest/globals";
import { ProfessionalError } from "../../src/modules/professional/professional.validator.js";

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
const mockCreateSharedRecipe = jest.fn();
const mockListSharedRecipes = jest.fn();

const mockValidateInviteClientInput = jest.fn();
const mockValidateListClientsInput = jest.fn();
const mockValidateMessageInput = jest.fn();
const mockValidateProfessionalId = jest.fn();
const mockValidateRelationshipInput = jest.fn();
const mockValidateSetGoalInput = jest.fn();
const mockValidateSummaryInput = jest.fn();
const mockValidateRecipeId = jest.fn();

jest.unstable_mockModule("../../src/modules/diary/diary.service.js", () => ({
  getDashboardDataForSubscriber: mockgetDashboardDataForSubscriber,
  getNutritionSummary: mockGetNutritionSummary,
}));

jest.unstable_mockModule("../../src/modules/goals/goals.service.js", () => ({
  createGoalForSubscriber: mockCreateGoalForSubscriber,
  getGoalsService: mockGetGoalsService,
}));

jest.unstable_mockModule("../../src/modules/professional/professional.repository.js", () => ({
  createProfessionalClientLink: mockCreateProfessionalClientLink,
  deleteProfessionalClientLink: mockDeleteProfessionalClientLink,
  findProfessionalClientLink: mockFindProfessionalClientLink,
  insertMessage: mockInsertMessage,
  listMessages: mockListMessages,
  listProfessionalClients: mockListProfessionalClients,
  updateRoleToProfessional: mockUpdateRoleToProfessional,
  createSharedRecipe: mockCreateSharedRecipe,
  listSharedRecipes: mockListSharedRecipes,
}));

jest.unstable_mockModule("../../src/modules/professional/professional.validator.js", () => ({
  ProfessionalError: ProfessionalError,
  validateInviteClientInput: mockValidateInviteClientInput,
  validateListClientsInput: mockValidateListClientsInput,
  validateMessageInput: mockValidateMessageInput,
  validateProfessionalId: mockValidateProfessionalId,
  validateRelationshipInput: mockValidateRelationshipInput,
  validateSetGoalInput: mockValidateSetGoalInput,
  validateSummaryInput: mockValidateSummaryInput,
  validateRecipeId: mockValidateRecipeId,
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
    ensureProfessionalClientRelation,
    shareRecipeWithClient,
    getSharedRecipes
} = await import("../../src/modules/professional/professional.service.js");

// now adding to dos
describe("Professional Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("setUserAsProfessional", () => {
        test("should set a user as a professional when given a valid professionalId", async () => {
            const validatorRes = {professionalId: PROFESSIONAL_ID};
            mockValidateProfessionalId.mockReturnValue(validatorRes);
            mockUpdateRoleToProfessional.mockReturnValue({
                userId: PROFESSIONAL_ID,
                role: "Professional"
            });

            const result = await setUserAsProfessional({professionalId: PROFESSIONAL_ID});

            expect(mockValidateProfessionalId).toHaveBeenCalledWith({professionalId: PROFESSIONAL_ID});
            expect(mockUpdateRoleToProfessional).toHaveBeenCalledWith(validatorRes);
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
            const validatorRes = {professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID};
            mockValidateInviteClientInput.mockReturnValue(validatorRes);
            mockFindProfessionalClientLink.mockReturnValue(null);
            const link = {professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID, status: "active"};
            mockCreateProfessionalClientLink.mockReturnValue(link);

            const result = await inviteClientToProfessional({ professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID });

            expect(mockFindProfessionalClientLink).toHaveBeenCalledWith({
                professionalId: PROFESSIONAL_ID,
                clientId: SUBSCRIBER_ID,
            });
            expect(mockCreateProfessionalClientLink).toHaveBeenCalledWith(validatorRes);
            expect(result).toEqual(
                link
            )
        });
        test("should throw ProfessionalError when the client is already assigned to the professional", async () => {
            const validatorRes = {professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID};
            mockValidateInviteClientInput.mockReturnValue(validatorRes);
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
            const validatorRes = {professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID};
            mockValidateInviteClientInput.mockReturnValue(validatorRes);
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
        test("should return list of clients assigned to the professional when given a valid professionalId", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, includeDetails: true };
            mockValidateListClientsInput.mockReturnValue(validatorRes);
            const clients = [{ id: SUBSCRIBER_ID, name: "Client User" }];
            mockListProfessionalClients.mockReturnValue(clients);

            const result = await getProfessionalClients({ professionalId: PROFESSIONAL_ID, include: "details" });

            expect(mockValidateListClientsInput).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, include: "details" });
            expect(mockListProfessionalClients).toHaveBeenCalledWith({
                professionalId: PROFESSIONAL_ID,
                includeDetails: true,
                status: "active",
            });
            expect(result).toEqual(clients);
        });
        test("should throw ProfessionalError if given an invalid professionalId", async () => {
            try {
                mockValidateListClientsInput.mockImplementation(() => {
                    throw new ProfessionalError("Professional ID is required");
                });
                await getProfessionalClients({ professionalId: null, include: "details" });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Professional ID is required");
            }
        });
    });

    describe("removeProfessionalClient", () => {
        test("should remove the client from professional if valid professionalId and clientId is provided", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            mockValidateRelationshipInput.mockReturnValue(validatorRes);
            const existingLink = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "active" };
            mockFindProfessionalClientLink.mockReturnValue(existingLink);
            const removedLink = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "disabled" };
            mockDeleteProfessionalClientLink.mockReturnValue(removedLink);

            const result = await removeProfessionalClient({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });

            expect(mockValidateRelationshipInput).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            expect(mockFindProfessionalClientLink).toHaveBeenCalledWith(validatorRes);
            expect(mockDeleteProfessionalClientLink).toHaveBeenCalledWith(validatorRes);
            expect(result).toEqual(removedLink);
        });
        test("should throw ProfessionalError if a valid relationship is not found", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            mockValidateRelationshipInput.mockReturnValue(validatorRes);
            mockFindProfessionalClientLink.mockReturnValue(null);

            try {
                await removeProfessionalClient({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Client relationship not found");
            }
        });
    });

    describe("getClientSummaryForProfessional", () => {
        test("should return the client summary when given valid professionalId and clientId", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, period: "week", endDate: "2026-04-20" };
            mockValidateSummaryInput.mockReturnValue(validatorRes);
            mockValidateRelationshipInput.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            mockFindProfessionalClientLink.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "active" });
            const summary = { calories: 1200, protein: 80 };
            mockGetNutritionSummary.mockReturnValue(summary);

            const result = await getClientSummaryForProfessional({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, period: "week", endDate: "2026-04-20" });

            expect(mockValidateSummaryInput).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, period: "week", endDate: "2026-04-20" });
            expect(mockGetNutritionSummary).toHaveBeenCalledWith({
                subscriberId: SUBSCRIBER_ID,
                period: "week",
                endDate: "2026-04-20",
            });
            expect(result).toEqual(summary);
        });
        test("should throw ProfessionalError if professionalId or clientId is invalid", async () => {
            try {
                mockValidateSummaryInput.mockImplementation(() => {
                    throw new ProfessionalError("Professional ID and Client ID are required");
                });
                await getClientSummaryForProfessional({ professionalId: null, clientId: null, period: "week", endDate: "2026-04-20" });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Professional ID and Client ID are required");
            }
        });
    });

    describe("getClientDashboardForProfessional", () => {
        test("should return the client dashboard when given valid professionalId and clientId", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            mockValidateRelationshipInput.mockReturnValue(validatorRes);
            mockFindProfessionalClientLink.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "active" });
            const dashboard = { entries: 5, streak: 4 };
            mockgetDashboardDataForSubscriber.mockReturnValue(dashboard);

            const result = await getClientDashboardForProfessional({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });

            expect(mockValidateRelationshipInput).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            expect(mockgetDashboardDataForSubscriber).toHaveBeenCalledWith({
                subscriberId: SUBSCRIBER_ID,
            });
            expect(result).toEqual(dashboard);
        });
        test("should throw ProfessionalError if professionalId or clientId is invalid", async () => {
            try {
                mockValidateRelationshipInput.mockImplementation(() => {
                    throw new ProfessionalError("Professional ID and Client ID are required");
                });
                await getClientDashboardForProfessional({ professionalId: null, clientId: null });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Professional ID and Client ID are required");
            }
        });
    });

    describe("sendMessageToClient", () => {
        test("should send a message to the client when given valid professionalId, clientId and message", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, message: "Keep going!" };
            mockValidateMessageInput.mockReturnValue(validatorRes);
            mockValidateRelationshipInput.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            mockFindProfessionalClientLink.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "active" });
            const insertedMessage = { id: 1, ...validatorRes };
            mockInsertMessage.mockReturnValue(insertedMessage);

            const result = await sendMessageToClient({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, message: "Keep going!" });

            expect(mockValidateMessageInput).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, message: "Keep going!" });
            expect(mockInsertMessage).toHaveBeenCalledWith(validatorRes);
            expect(result).toEqual(insertedMessage);
        });
        test("should throw ProfessionalError if professionalId, clientId or message is invalid", async () => {
            try {
                mockValidateMessageInput.mockImplementation(() => {
                    throw new ProfessionalError("Professional ID, Client ID and message are required");
                });
                await sendMessageToClient({ professionalId: null, clientId: null, message: "" });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Professional ID, Client ID and message are required");
            }
        });
    });

    describe("getMessagesWithClient", () => {
        test("should return the list of messages between professional and client when given valid professionalId and clientId", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            mockValidateRelationshipInput.mockReturnValue(validatorRes);
            mockFindProfessionalClientLink.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "active" });
            const messages = [{ id: 1, message: "Hello" }];
            mockListMessages.mockReturnValue(messages);

            const result = await getMessagesWithClient({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });

            expect(mockValidateRelationshipInput).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            expect(mockListMessages).toHaveBeenCalledWith(validatorRes);
            expect(result).toEqual(messages);
        });
        test("should throw ProfessionalError if professionalId or clientId is invalid", async () => {
            try {
                mockValidateRelationshipInput.mockImplementation(() => {
                    throw new ProfessionalError("Professional ID and Client ID are required");
                });
                await getMessagesWithClient({ professionalId: null, clientId: null });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Professional ID and Client ID are required");
            }
        });
    });

    describe("setGoalForClient", () => {
        test("should set a goal for the client when given valid professionalId, clientId and goal data", async () => {
            const goalInput = { nutritionId: 1, targetValue: 2000 };
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, goal: goalInput };
            mockValidateSetGoalInput.mockReturnValue(validatorRes);
            mockValidateRelationshipInput.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            mockFindProfessionalClientLink.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "active" });
            const goalResult = { id: 9, goal: goalInput, status: "active" };
            mockCreateGoalForSubscriber.mockReturnValue(goalResult);

            const result = await setGoalForClient({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, goal: goalInput });

            expect(mockValidateSetGoalInput).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, goal: goalInput });
            expect(mockCreateGoalForSubscriber).toHaveBeenCalledWith({
                subscriberId: SUBSCRIBER_ID,
                goal: goalInput,
                options: {
                    forcedSource: "professional_defined",
                    forcedStatus: "active",
                    forcedSetByProfessionalId: PROFESSIONAL_ID,
                },
            });
            expect(result).toEqual(goalResult);
        });
        test("should throw ProfessionalError if professionalId, clientId or goal data is invalid", async () => {
            try {
                mockValidateSetGoalInput.mockImplementation(() => {
                    throw new ProfessionalError("Professional ID, Client ID and goal are required");
                });
                await setGoalForClient({ professionalId: null, clientId: null, goal: null });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Professional ID, Client ID and goal are required");
            }
        });
    });

    describe("getClientGoalsForProfessional", () => {
        test("should return list of goals for the client when given valid professionalId and clientId", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            mockValidateRelationshipInput.mockReturnValue(validatorRes);
            mockFindProfessionalClientLink.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "active" });
            const goals = [{ id: 1, name: "Protein", status: "active" }];
            mockGetGoalsService.mockReturnValue(goals);

            const result = await getClientGoalsForProfessional({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });

            expect(mockValidateRelationshipInput).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            expect(mockGetGoalsService).toHaveBeenCalledWith({ subscriberId: SUBSCRIBER_ID, effective: true });
            expect(result).toEqual(goals);
        });
        test("should throw ProfessionalError if professionalId or clientId is invalid", async () => {
            try {
                mockValidateRelationshipInput.mockImplementation(() => {
                    throw new ProfessionalError("Professional ID and Client ID are required");
                });
                await getClientGoalsForProfessional({ professionalId: null, clientId: null });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Professional ID and Client ID are required");
            }
        });
    });

    describe("ensureProfessionalClientRelation", () => {
        test("should not throw an error if a valid professional-client relationship exists", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            mockValidateRelationshipInput.mockReturnValue(validatorRes);
            mockFindProfessionalClientLink.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "active" });

            const result = await ensureProfessionalClientRelation({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });

            expect(mockValidateRelationshipInput).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            expect(mockFindProfessionalClientLink).toHaveBeenCalledWith(validatorRes);
            expect(result).toEqual(validatorRes);
        });
        test("should throw ProfessionalError if no relationship exists", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            mockValidateRelationshipInput.mockReturnValue(validatorRes);
            mockFindProfessionalClientLink.mockReturnValue(null);

            try {
                await ensureProfessionalClientRelation({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Client is not assigned to this professional");
            }
        });
        test("should throw ProfessionalError if the relationship exists but is not active", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            mockValidateRelationshipInput.mockReturnValue(validatorRes);
            mockFindProfessionalClientLink.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "disabled" });

            try {
                await ensureProfessionalClientRelation({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Client is not assigned to this professional");
            }
        });
        test("should throw ProfessionalError if professionalId or clientId is invalid", async () => {
            try {
                mockValidateRelationshipInput.mockImplementation(() => {
                    throw new ProfessionalError("Professional ID and Client ID are required");
                });
                await ensureProfessionalClientRelation({ professionalId: null, clientId: null });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Professional ID and Client ID are required");
            }
        });
    });

    describe("shareRecipeWithClient", () => {
        test("when given valid professionalId, clientId and recipeId, it should share the recipe with the client", async () => {
            const relationshipValidatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            const recipeValidatorRes = { recipeId: 10 };
            mockValidateRelationshipInput.mockReturnValue(relationshipValidatorRes);
            mockValidateRecipeId.mockReturnValue(recipeValidatorRes);
            mockFindProfessionalClientLink.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "active" });
            const sharedRecipe = { id: 1, professionalId: PROFESSIONAL_ID, subscriberId: SUBSCRIBER_ID, recipeId: 10 };
            mockCreateSharedRecipe.mockReturnValue(sharedRecipe);

            const result = await shareRecipeWithClient({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, recipeId: 10 });

            expect(mockValidateRelationshipInput).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            expect(mockValidateRecipeId).toHaveBeenCalledWith({ recipeId: 10 });
            expect(mockCreateSharedRecipe).toHaveBeenCalledWith({
                professionalId: PROFESSIONAL_ID,
                clientId: SUBSCRIBER_ID,
                recipeId: 10,
            });
            expect(result).toEqual(sharedRecipe);
        });
        test("if recipeId is invalid, it should throw ProfessionalError", async () => {
            const relationshipValidatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            mockValidateRelationshipInput.mockReturnValue(relationshipValidatorRes);

            try {
                mockValidateRecipeId.mockImplementation(() => {
                    throw new ProfessionalError("Recipe ID is required");
                });
                await shareRecipeWithClient({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, recipeId: null });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Recipe ID is required");
            }
        });
        test("if client is not assigned to this professional, it should throw ProfessionalError", async () => {
            const relationshipValidatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            const recipeValidatorRes = { recipeId: 10 };
            mockValidateRelationshipInput.mockReturnValue(relationshipValidatorRes);
            mockValidateRecipeId.mockReturnValue(recipeValidatorRes);
            mockFindProfessionalClientLink.mockReturnValue(null);

            try {
                await shareRecipeWithClient({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, recipeId: 10 });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Client is not assigned to this professional");
            }
        });
    });

    describe("getSharedRecipes", () => {
        test("on valid input(professionalId and clientId), it should return list of shared recipes", async () => {
            const validatorRes = { professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID };
            mockValidateRelationshipInput.mockReturnValue(validatorRes);
            mockFindProfessionalClientLink.mockReturnValue({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID, status: "active" });
            const sharedRecipes = [{ id: 1, recipeId: 10 }];
            mockListSharedRecipes.mockReturnValue(sharedRecipes);

            const result = await getSharedRecipes({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });

            expect(mockValidateRelationshipInput).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            expect(mockListSharedRecipes).toHaveBeenCalledWith({ professionalId: PROFESSIONAL_ID, clientId: SUBSCRIBER_ID });
            expect(result).toEqual(sharedRecipes);
        });
        test("if professionalId or clientId is invalid, it should throw ProfessionalError", async () => {
            try {
                mockValidateRelationshipInput.mockImplementation(() => {
                    throw new ProfessionalError("Professional ID and Client ID are required");
                });
                await getSharedRecipes({ professionalId: null, clientId: null });
            } catch (error) {
                expect(error).toBeInstanceOf(ProfessionalError);
                expect(error.message).toBe("Professional ID and Client ID are required");
            }
        });
    });

});
