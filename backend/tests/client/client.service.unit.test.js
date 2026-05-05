import { expect, jest } from "@jest/globals";
import { ClientError } from "../../src/modules/client/client.validator.js";

// Mocks
const TEST_PROFESSIONALID = 1;
const TEST_PROFESSIONALID_FAIL = "bad_professionalId"
const TEST_OTHER_PROFESSIONALID = 3;
const TEST_CLIENTID = 2;
const TEST_CLIENTID_FAIL = "bad_userId";

// client.validation mocks
const mockValidateClientId = jest.fn();
const mockValidateProfessionalId = jest.fn();
const mockValidateClientProfessionalInput = jest.fn();
const mockValidateMessageInput = jest.fn();

// client.repository mocks
const mockFindProfessionalClientLink = jest.fn();
const mockAcceptProfessionalInvitation = jest.fn();
const mockRejectProfessionalInvitation = jest.fn();
const mockListClientProfessionals = jest.fn();
const mockDisableProfessionalClientLink = jest.fn();
const mockInsertMessage = jest.fn();
const mockListMessages = jest.fn();
const mockListSharedRecipes = jest.fn();

// ensureProfessionalClientRelation mock (from client.service)
const mockEnsureProfessionalClientRelation = jest.fn();

jest.unstable_mockModule("../../src/modules/client/client.validator.js", () => ({
    ClientError: ClientError,
    validateClientId: mockValidateClientId,
    validateProfessionalId: mockValidateProfessionalId,
    validateClientProfessionalInput: mockValidateClientProfessionalInput,
    validateMessageInput: mockValidateMessageInput
}));

jest.unstable_mockModule("../../src/modules/client/client.repository.js", () => ({
    findProfessionalClientLink: mockFindProfessionalClientLink,
    acceptProfessionalInvitation: mockAcceptProfessionalInvitation,
    rejectProfessionalInvitation: mockRejectProfessionalInvitation,
    listClientProfessionals: mockListClientProfessionals,
    disableProfessionalClientLink: mockDisableProfessionalClientLink,
    insertMessage: mockInsertMessage,
    listMessages: mockListMessages,
    listSharedRecipes: mockListSharedRecipes
}));

jest.unstable_mockModule("../../src/modules/client/client.service.js", () => ({
    ensureProfessionalClientRelation: mockEnsureProfessionalClientRelation
}));

const {
    acceptInvitationService,
    rejectInvitationService,
    listProfessionalsService,
    removeProfessionalService,
    sendMessageToProfessional,
    listMessagesService,
    listSharedRecipesService
} = await import("../../src/modules/client/client.service.js");

describe("Client service", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // validation mock implementations
        mockValidateClientId.mockImplementation((id) => id); 
        mockValidateProfessionalId.mockImplementation((id) => id);
        mockValidateClientProfessionalInput.mockImplementation(() => true);
        mockValidateMessageInput.mockImplementation(() => true);
        mockEnsureProfessionalClientRelation.mockImplementation(() => true);

    });
    describe("acceptInvitationService (unit)", () => {
        // success path
        test("client accepts invitation from professional when inputs are valid", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            const invitation = {
                ...validatedInput,
                status: "invitated"
            };
            const accepted = {
                ...validatedInput,
                status: "active"
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue(invitation);
            mockAcceptProfessionalInvitation.mockResolvedValue(accepted);

            const result = await acceptInvitationService(validatedInput);

            expect(mockValidateClientProfessionalInput).toHaveBeenCalledWith(validatedInput);
            expect(mockFindProfessionalClientLink).toHaveBeenCalledWith(validated);
            expect(mockAcceptProfessionalInvitation).toHaveBeenCalledWith(validated);
            expect(result).toEqual(accepted);
        });
        // invalid paths
        test("throws ClientError when clientId is missing or invalid", async () => {
            mockValidateClientProfessionalInput.mockImplementation(() => {
                throw new ClientError("Client ID is required");
            });

            await expect(acceptInvitationService({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID_FAIL
            })).rejects.toThrow("Client ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockAcceptProfessionalInvitation).not.toHaveBeenCalled();
        });
        test("throws ClientError when professionalId is missing or invalid", async () => {
            mockValidateClientProfessionalInput.mockImplementation(() => {
                throw new ClientError("Professional ID is required");
            });

            await expect(acceptInvitationService({
                professionalId: TEST_PROFESSIONALID_FAIL,
                clientId: TEST_CLIENTID
            })).rejects.toThrow("Professional ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockAcceptProfessionalInvitation).not.toHaveBeenCalled();
        });
        test("throws ClientError when invitation doesn't exist", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue(null);

            await expect(acceptInvitationService(validatedInput)).rejects.toThrow("Invitation not found");
            expect(mockAcceptProfessionalInvitation).not.toHaveBeenCalled();
        });
        test("throws ClientError when invitation is already active", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            const invitation = {
                ...validatedInput,
                status: "active"
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue(invitation);

            await expect(acceptInvitationService(validatedInput)).rejects.toThrow("Invitation already found");
            expect(mockAcceptProfessionalInvitation).not.toHaveBeenCalled();
        });
        test("throws ClientError when invitation is already disabled", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue({
                ...validatedInput,
                status: "disabled"
            });

            await expect(acceptInvitationService(validatedInput)).rejects.toThrow("Invitation already disabled");
            expect(mockAcceptProfessionalInvitation).not.toHaveBeenCalled();
        });
        test("throws ClientError when invitation is not in invited status", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue({
                ...validatedInput,
                status: "pending"
            });

            await expect(acceptInvitationService(validatedInput)).rejects.toThrow("Invitation is not in invited status");
            expect(mockAcceptProfessionalInvitation).not.toHaveBeenCalled();
        });
    });
    describe("rejectInvitationService (unit)", () => {
        // success path
        test("client rejects invitation from professional when inputs are valid", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            const invitation = {
                ...validatedInput,
                status: "invitated"
            };
            const rejected = {
                ...validatedInput,
                status: "disabled"
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue(invitation);
            mockRejectProfessionalInvitation.mockResolvedValue(rejected);

            const result = await rejectInvitationService(validatedInput);

            expect(mockValidateClientProfessionalInput).toHaveBeenCalledWith(validatedInput);
            expect(mockFindProfessionalClientLink).toHaveBeenCalledWith(validated);
            expect(mockRejectProfessionalInvitation).toHaveBeenCalledWith(validated);
            expect(result).toEqual(rejected);
        });
        // invalid paths
        test("throws ClientError when clientId is missing or invalid", async () => {
            mockValidateClientProfessionalInput.mockImplementation(() => {
                throw new ClientError("Client ID is required");
            });

            await expect(rejectInvitationService({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID_FAIL
            })).rejects.toThrow("Client ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockRejectProfessionalInvitation).not.toHaveBeenCalled();
        });
        test("throws ClientError when professionalId is missing or invalid", async () => {
            mockValidateClientProfessionalInput.mockImplementation(() => {
                throw new ClientError("Professional ID is required");
            });

            await expect(rejectInvitationService({
                professionalId: TEST_PROFESSIONALID_FAIL,
                clientId: TEST_CLIENTID
            })).rejects.toThrow("Professional ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockRejectProfessionalInvitation).not.toHaveBeenCalled();
        });
        test("throws ClientError when invitation doesn't exist", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue(null);

            await expect(rejectInvitationService(validatedInput)).rejects.toThrow("Invitation not found");
            expect(rejectInvitationService).not.toHaveBeenCalled();
        });
        test("throws ClientError when invitation is already active", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            const invitation = {
                ...validatedInput,
                status: "active"
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue(invitation);

            await expect(rejectInvitationService(validatedInput)).rejects.toThrow("Invitation already found");
            expect(mockRejectProfessionalInvitation).not.toHaveBeenCalled();
        });
        test("throws ClientError when invitation is already disabled", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue({
                ...validatedInput,
                status: "disabled"
            });

            await expect(rejectInvitationService(validatedInput)).rejects.toThrow("Invitation already disabled");
            expect(mockRejectProfessionalInvitation).not.toHaveBeenCalled();
        });
        test("throws ClientError when invitation is not in invited status", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue({
                ...validatedInput,
                status: "pending"
            });

            await expect(rejectInvitationService(validatedInput)).rejects.toThrow("Invitation is not in invited status");
            expect(mockRejectProfessionalInvitation).not.toHaveBeenCalled();
        });
    });
    describe("listProfessionalService (unit)", () => {
        // success path
        test("lists professional connection with client when inputs are valid", async () => {
            const clientProfessionalList = [{
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID,
                status: "active"
            }]
            mockValidateClientId.mockReturnValue({
                clientId: TEST_CLIENTID
            });
            mockListClientProfessionals.mockResolvedValue(clientProfessionalList);

            const result = await listProfessionalsService({
                clientId: TEST_CLIENTID,
                status: "active"
            })

            expect(mockValidateClientId).toHaveBeenCalledWith({
                clientId: TEST_CLIENTID
            });
            expect(mockListClientProfessionals).toHaveBeenCalledWith({
                clientId: TEST_CLIENTID,
                status: "active"
            });
            expect(result).toEqual(clientProfessionalList);
        });
        // invalid paths
        test("throws ClientError when clientId is missing or invalid", async () => {
            mockValidateClientId.mockImplementation(() => {
                throw new ClientError("Client ID is required");
            });

            await expect(listProfessionalsService({
                clientId: TEST_CLIENTID_FAIL,
                status: "active"
            })).rejects.toThrow("Client ID is required");

            expect(mockListClientProfessionals).not.toHaveBeenCalled();
        });
        test("throws ClientError when status value is invalid", async () => {
            mockValidateClientId.mockReturnValue({
                clientId: TEST_CLIENTID
            });

            await expect(listProfessionalsService({
                clientId: TEST_CLIENTID,
                status: "pending"
            })).rejects.toThrow("Invalid status value");

            expect(mockListClientProfessionals).not.toHaveBeenCalled();
        });
    });
    describe("removeProfessionalService (unit)", () => {
        // success path
        test("removes professional connection with client when inputs are valid", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue({
                ...validatedInput,
                status: "active"
            });
            mockDisableProfessionalClientLink.mockResolvedValue({
                ...validatedInput,
                status: "disabled"
            });

            const result = await removeProfessionalService(validatedInput);

            expect(mockValidateClientProfessionalInput).toHaveBeenCalledWith(validatedInput);
            expect(mockFindProfessionalClientLink).toHaveBeenCalledWith(validated);
            expect(mockDisableProfessionalClientLink).toHaveBeenCalledWith(validated);
            expect(result).toEqual({
                ...validatedInput,
                status: "disabled"
            });
        });
        // invalid paths
        test("throws ClientError when clientId is missing or invalid", async () => {
            mockValidateClientProfessionalInput.mockImplementation(() => {
                throw new ClientError("Client ID is required");
            });

            await expect(removeProfessionalService({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID_FAIL
            })).rejects.toThrow("Client ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockDisableProfessionalClientLink).not.toHaveBeenCalled();
        });
        test("throws ClientError when professionalId is missing or invalid", async () => {
            mockValidateClientProfessionalInput.mockImplementation(() => {
                throw new ClientError("Professional ID is required");
            });

            await expect(removeProfessionalService({
                professionalId: TEST_PROFESSIONALID_FAIL,
                clientId: TEST_CLIENTID
            })).rejects.toThrow("Professional ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockDisableProfessionalClientLink).not.toHaveBeenCalled();
        });
        test("throws ClientError when client is not assigned to the professional", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue(null);

            await expect(removeProfessionalService({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID_FAIL
            })).rejects.toThrow("Client is not assigned to this professional");

            expect(mockDisableProfessionalClientLink).not.toHaveBeenCalled();
        });
    });
    describe("sendMessageToProfessional (unit)", () => {
        // success path
        test("client sends message to professional when inputs are valid and relation status is active", async () => {
            const validatedMessage = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID,
                message: "hello"
            };
            mockValidateMessageInput.mockReturnValue(validatedMessage);
            mockValidateClientProfessionalInput.mockReturnValue({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            });
            mockFindProfessionalClientLink.mockResolvedValue({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID,
                status: "active"
            });
            mockInsertMessage.mockResolvedValue({
                messageId: 1,
                ...validatedMessage
            })

            const result = await sendMessageToProfessional(validatedInput);

            expect(mockValidateMessageInput).toHaveBeenCalledWith(validatedMessage);
            expect(mockValidateClientProfessionalInput).toHaveBeenCalledWith({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            });
            expect(mockFindProfessionalClientLink).toHaveBeenCalledWith({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID,
            });
            expect(mockInsertMessage).toHaveBeenCalledWith(validatedMessage);
            expect(result).toEqual({
                messageId: 1,
                ...validatedMessage
            });
        });
        // invalid paths
        test("throws ClientError when clientId is missing or invalid", async () => {
            const validatedMessage = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID,
                message: "hello"
            };
            mockValidateMessageInput.mockReturnValue(validatedMessage);
            mockValidateClientProfessionalInput.mockImplementation(() => {
                throw new ClientError("Client ID is required");
            });

            await expect(sendMessageToProfessional({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID_FAIL,
                message: "message"
            })).rejects.toThrow("Client ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockInsertMessage).not.toHaveBeenCalled();
        });
        test("throws ClientError when professionalId is missing or invalid", async () => {
            mockValidateMessageInput.mockImplementation(() => {
                throw new ClientError("Professional ID is required");
            });

            await expect(sendMessageToProfessional({
                professionalId: TEST_PROFESSIONALID_FAIL,
                clientId: TEST_CLIENTID,
                message: "message"
            })).rejects.toThrow("Professional ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockInsertMessage).not.toHaveBeenCalled();
        });
        test("throws ClientError when message is not a string value", async () => {
            mockValidateMessageInput.mockImplementation(() => {
                throw new ClientError("message is required");
            });

            await expect(sendMessageToProfessional({
                professionalId: TEST_PROFESSIONALID_FAIL,
                clientId: TEST_CLIENTID,
                message: "message"
            })).rejects.toThrow("message is required");

            expect(mockValidateClientProfessionalInput).not.toHaveBeenCalled();
            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockInsertMessage).not.toHaveBeenCalled();
        });
        test("throws ClientError when client is not assigned to the professional", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID,
                message: "hello"
            };
            mockValidateMessageInput.mockReturnValue(validatedInput);
            mockValidateClientProfessionalInput.mockReturnValue({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            });
            mockFindProfessionalClientLink.mockResolvedValue(null);

            await expect(sendMessageToProfessional({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            })).rejects.toThrow("Client is not assigned to this professional");

            expect(mockInsertMessage).not.toHaveBeenCalled();
        });
    });
    describe("listMessagesService (unit)", () => {
        // success path
        test("lists messages between professional and client", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            const messages = [
                { 
                    messageId: 1,
                    professionalId: TEST_PROFESSIONALID,
                    clientId: TEST_CLIENTID,
                    message: "Hello!"
                },
                {
                    messageId: 2,
                    professionalId: TEST_PROFESSIONALID,
                    clientId: TEST_CLIENTID,
                    message: "How's your progress so far?"
                }
            ];
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue({
                ...validatedInput,
                status: "active"
            });
            mockListMessages.mockResolvedValue(messages);

            const result = await removeProfessionalService(validatedInput);

            expect(mockValidateClientProfessionalInput).toHaveBeenCalledWith(validatedInput);
            expect(mockFindProfessionalClientLink).toHaveBeenCalledWith(validatedInput);
            expect(mockListMessages).toHaveBeenCalledWith(validatedInput);
            expect(result).toEqual(messages);
        });
        // invalid paths
        test("throws ClientError when clientId is missing or invalid", async () => {
            mockValidateClientProfessionalInput.mockImplementation(() => {
                throw new ClientError("Client ID is required");
            });

            await expect(listMessagesService({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID_FAIL
            })).rejects.toThrow("Client ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockListMessages).not.toHaveBeenCalled();
        });
        test("throws ClientError when professionalId is missing or invalid", async () => {
            mockValidateClientProfessionalInput.mockImplementation(() => {
                throw new ClientError("Professional ID is required");
            });

            await expect(listMessagesService({
                professionalId: TEST_PROFESSIONALID_FAIL,
                clientId: TEST_CLIENTID
            })).rejects.toThrow("Professional ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockListMessages).not.toHaveBeenCalled();
        });
        test("throws ClientError when client is not assigned to the professional", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue(null);

            await expect(listMessagesService({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            })).rejects.toThrow("Client is not assigned to this professional");

            expect(mockListMessages).not.toHaveBeenCalled();
        });
    });
    describe("listSharedRecipesService (unit)", () => {
        // success path
        test("lists shared recipes between professional and client", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            const recipes = [
                {
                    recipeId: 1,
                    title: "Carrot soup",
                    sharedByProfessionalId: TEST_PROFESSIONALID
                },
                {
                    recipeId: 2,
                    title: "Chickpea salad",
                    sharedByProfessionalId: TEST_PROFESSIONALID
                },
            ]
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue({
                ...validatedInput,
                status: "active"
            });
            mockListSharedRecipes.mockResolvedValue(recipes);

            const result = await listSharedRecipesService(validatedInput);

            expect(mockValidateClientProfessionalInput).toHaveBeenCalledWith(validatedInput);
            expect(mockFindProfessionalClientLink).toHaveBeenCalledWith(validated);
            expect(mockListSharedRecipes).toHaveBeenCalledWith(validated);
            expect(result).toEqual(recipes);
        });
        // invalid paths
        test("throws ClientError when clientId is missing or invalid", async () => {
            mockValidateClientProfessionalInput.mockImplementation(() => {
                throw new ClientError("Client ID is required");
            });

            await expect(listSharedRecipesService({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID_FAIL
            })).rejects.toThrow("Client ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockListSharedRecipes).not.toHaveBeenCalled();
        });
        test("throws ClientError when professionalId is missing or invalid", async () => {
            mockValidateClientProfessionalInput.mockImplementation(() => {
                throw new ClientError("Professional ID is required");
            });

            await expect(listSharedRecipesService({
                professionalId: TEST_PROFESSIONALID_FAIL,
                clientId: TEST_CLIENTID
            })).rejects.toThrow("Professional ID is required");

            expect(mockFindProfessionalClientLink).not.toHaveBeenCalled();
            expect(mockListSharedRecipes).not.toHaveBeenCalled();
        });
        test("throws ClientError when client is not assigned to the professional", async () => {
            const validatedInput = {
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            };
            mockValidateClientProfessionalInput.mockReturnValue(validatedInput);
            mockFindProfessionalClientLink.mockResolvedValue(null);

            await expect(listSharedRecipesService({
                professionalId: TEST_PROFESSIONALID,
                clientId: TEST_CLIENTID
            })).rejects.toThrow("Client is not assigned to this professional");

            expect(mockListSharedRecipes).not.toHaveBeenCalled();
        });
    });
});