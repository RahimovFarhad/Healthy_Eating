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

const {
    acceptInvitationService,
    rejectInvitationService,
    listProfessionalsService,
    removeProfessionalService,
    sendMessageToProfessional,
    listMessagesService,
    listSharedRecipesService
} = await import("../../src/modules/client/client.service.js");