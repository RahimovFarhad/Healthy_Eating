import { expect, jest } from "@jest/globals";
import { ClientError } from "../../src/modules/client/client.validator.js";

// mocks
const TEST_PROFESSIONALID = 1;
const TEST_PROFESSIONALID_FAIL = "bad_professionalId"
const TEST_OTHER_PROFESSIONALID = 3;
const TEST_CLIENTID = 2;
const TEST_CLIENTID_FAIL = "bad_userId";

// client.service mock functions
const mockAcceptInvitationService = jest.fn();
const mockRejectInvitationService = jest.fn();
const mockListProfessionalsService = jest.fn();
const mockRemoveProfessionalService = jest.fn();
const mockSendMessageToProfessional = jest.fn();
const mockListMessagesService = jest.fn();
const mockListSharedRecipesService = jest.fn();

jest.unstable_mockModule("../../src/modules/client/client.service.js", () => ({
    acceptInvitationService: mockAcceptInvitationService,
    rejectInvitationService: mockRejectInvitationService,
    listProfessionalsService: mockListProfessionalsService,
    removeProfessionalService: mockRemoveProfessionalService,
    sendMessageToProfessional: mockSendMessageToProfessional,
    listMessagesService: mockListMessagesService,
    listSharedRecipesService: mockListSharedRecipesService,
}));

const {
    acceptInvitation,
    rejectInvitation,
    listProfessionals,
    removeProfessional,
    sendMessage,
    listMessages,
    listInvitations,
    listSharedRecipes
} = await import ("../../src/modules/client/client.controller.js");

function createRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    
    return res;
}

describe("Client Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("acceptInvitation", () => {
    // successful paths
    test("Returns status code 200 and accepts invitation when successful", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      const invitationDetails = {
          professionalId: TEST_PROFESSIONALID,
          clientId: TEST_CLIENTID, 
      }
      
      mockAcceptInvitationService.mockResolvedValue(invitationDetails);

      await acceptInvitation(req,res,next);

      expect(mockAcceptInvitationService).toHaveBeenCalledWith({
        professionalId: TEST_PROFESSIONALID,
        clientId: TEST_CLIENTID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Invitation accepted successfully" });
      expect(next).not.toHaveBeenCalledWith();
    });
    // failure paths
    test("Returns error code 403 when invitation status is not in invited", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockAcceptInvitationService.mockRejectedValue(new ClientError("Invitation is not in invited status"));

      await acceptInvitation(req,res,next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Invitation is not in invited status" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 404 when invitation is not found", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockAcceptInvitationService.mockRejectedValue(new ClientError("Invitation not found"));

      await acceptInvitation(req,res,next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Invitation not found" });
      expect(next).not.toHaveBeenCalledWith();  
    });
    test("Returns error code 409 when invitation status is already active", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockAcceptInvitationService.mockRejectedValue(new ClientError("Invitation already active"));

      await acceptInvitation(req,res,next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "Invitation already active" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 409 when invitation status is already disabled", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockAcceptInvitationService.mockRejectedValue(new ClientError("Invitation already disabled"));

      await acceptInvitation(req,res,next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "Invitation already disabled" });
      expect(next).not.toHaveBeenCalledWith();
    });
  });

  describe("rejectInvitation", () => {
    // successful path
    test("Returns status code 200 and rejects invitation when successful", async () => {
      const req = {
          params: {
            professionalId: TEST_PROFESSIONALID
          },
          user: {
            userId: TEST_CLIENTID
          }
      };
      const res = createRes();
      const next = jest.fn();
      const invitationDetails = {
          professionalId: TEST_PROFESSIONALID,
          clientId: TEST_CLIENTID, 
      }
      
      mockRejectInvitationService.mockResolvedValue(invitationDetails);

      await rejectInvitation(req,res,next);

      expect(mockRejectInvitationService).toHaveBeenCalledWith({
        professionalId: TEST_PROFESSIONALID,
        clientId: TEST_CLIENTID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Invitation rejected successfully" });
      expect(next).not.toHaveBeenCalledWith();
    });
    // failure paths
    test("Returns error code 403 when invitation status is not in invited", async () => {
      const req = {
          params: {
            professionalId: TEST_PROFESSIONALID
          },
          user: {
            userId: TEST_CLIENTID
          }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockRejectInvitationService.mockRejectedValue(new ClientError("Invitation is not in invited status"));

      await rejectInvitation(req,res,next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Invitation is not in invited status" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 404 when invitation is not found", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockRejectInvitationService.mockRejectedValue(new ClientError("Invitation not found"));

      await rejectInvitation(req,res,next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Invitation not found" });
      expect(next).not.toHaveBeenCalledWith();  
    });
    test("Returns error code 409 when invitation status is already active", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockRejectInvitationService.mockRejectedValue(new ClientError("Invitation already active"));

      await rejectInvitation(req,res,next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "Invitation already active" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 409 when invitation status is already disabled", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockRejectInvitationService.mockRejectedValue(new ClientError("Invitation already disabled"));

      await rejectInvitation(req,res,next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "Invitation already disabled" });
      expect(next).not.toHaveBeenCalledWith();
    });
  });

  describe("listProfessionals", () => {
    // successful paths
    test("Returns status code 200 and lists professionals given the status is active", async () => {
      const req = {
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      const list = {
        clientId: TEST_CLIENTID,
        status: "active"
      }
      
      mockListProfessionalsService.mockResolvedValue(list);

      await listProfessionals(req,res,next);

      expect(mockListProfessionalsService).toHaveBeenCalledWith({
        clientId: TEST_CLIENTID
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ professionals: list });
      expect(next).not.toHaveBeenCalledWith();
    });
    // failure paths
    test("Returns error code 400 when client ID is missing or invalid", async () => {
      const req = {
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockListProfessionalsService.mockRejectedValue(new ClientError("Client ID is required"));

      await listProfessionals(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Client ID is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 400 when status is invalid", async () =>{
      const req = {
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockListProfessionalsService.mockRejectedValue(new ClientError("Invalid status value"));

      await listProfessionals(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid status value" });
      expect(next).not.toHaveBeenCalledWith();
    });
  });

  describe("removeProfessional", () => {
    // successful paths
    test("Returns status code 200 and removes professional connection from client", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      const details = {
          professionalId: TEST_PROFESSIONALID,
          clientId: TEST_CLIENTID, 
      }
      
      mockRemoveProfessionalService.mockResolvedValue(details);

      await removeProfessional(req,res,next);

      expect(mockRemoveProfessionalService).toHaveBeenCalledWith({
        professionalId: TEST_PROFESSIONALID,
        clientId: TEST_CLIENTID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Professional removed successfully" });
      expect(next).not.toHaveBeenCalledWith();
    });
    // failure paths
    test("Returns error code 400 when client ID is missing or invalid", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID_FAIL
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockRemoveProfessionalService.mockRejectedValue(new ClientError("Client ID is required"));

      await removeProfessional(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Client ID is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 400 when professional ID is missing or invalid", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID_FAIL
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockRemoveProfessionalService.mockRejectedValue(new ClientError("Professional ID is required"));

      await removeProfessional(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Professional ID is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 403 when client is not assigned to the professional", async () => {
      const req = {
        params: {
          professionalId: TEST_OTHER_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockRemoveProfessionalService.mockRejectedValue(new ClientError("Client is not assigned to this professional"));

      await removeProfessional(req,res,next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Client is not assigned to this professional" });
      expect(next).not.toHaveBeenCalledWith();
    });
  });

  describe("sendMessage", () => {
    // successful paths
    test("Returns status code 200 and sends message to professional", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        },
        body: {
          message: "success"
        }
      };
      const res = createRes();
      const next = jest.fn();
      const details = {
          professionalId: TEST_PROFESSIONALID,
          clientId: TEST_CLIENTID,
          message: "success" 
      }
      
      mockSendMessageToProfessional.mockResolvedValue(details);

      await sendMessage(req,res,next);

      expect(mockSendMessageToProfessional).toHaveBeenCalledWith({
        professionalId: TEST_PROFESSIONALID,
        clientId: TEST_CLIENTID,
        message: "success"
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Message sent successfully",
        sentMessage: details,
      });
      expect(next).not.toHaveBeenCalledWith();
    });
    // failure paths
    test("Returns error code 400 when client ID is missing or invalid", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID_FAIL
        },
        body: {
          message: "message"
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockSendMessageToProfessional.mockRejectedValue(new ClientError("Client ID is required"));

      await sendMessage(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Client ID is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 400 when professional ID is missing or invalid", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID_FAIL
        },
        user: {
          userId: TEST_CLIENTID
        },
        body: {
          message: "message"
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockSendMessageToProfessional.mockRejectedValue(new ClientError("Professional ID is required"));

      await sendMessage(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Professional ID is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 400 when message is missing, not a string or invalid", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        },
        body: {
          message: 1
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockSendMessageToProfessional.mockRejectedValue(new ClientError("message is required"));

      await sendMessage(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "message is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 403 when client is not assigned to the professional", async () => {
      const req = {
        params: {
          professionalId: TEST_OTHER_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        },
        body: {
          message: 1
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockSendMessageToProfessional.mockRejectedValue(new ClientError("Client is not assigned to this professional"));

      await sendMessage(req,res,next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Client is not assigned to this professional" });
      expect(next).not.toHaveBeenCalledWith();
    });
  });

  describe("listMessages", () => {
    // successful paths
    test("Returns status code 200 and shows messages with the professional", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      const details = {
          professionalId: TEST_PROFESSIONALID,
          clientId: TEST_CLIENTID, 
      }
      
      mockListMessagesService.mockResolvedValue(details);

      await listMessages(req,res,next);

      expect(mockListMessagesService).toHaveBeenCalledWith({
        professionalId: TEST_PROFESSIONALID,
        clientId: TEST_CLIENTID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ messages: details });
      expect(next).not.toHaveBeenCalledWith();
    });
    // failure paths
    test("Returns error code 400 when client ID is missing or invalid", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID_FAIL
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockListMessagesService.mockRejectedValue(new ClientError("Client ID is required"));

      await listMessages(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Client ID is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 400 when professional ID is missing or invalid", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID_FAIL
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockListMessagesService.mockRejectedValue(new ClientError("Professional ID is required"));

      await listMessages(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Professional ID is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 403 when client is not assigned to the professional", async () => {
      const req = {
        params: {
          professionalId: TEST_OTHER_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockListMessagesService.mockRejectedValue(new ClientError("Client is not assigned to this professional"));

      await listMessages(req,res,next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Client is not assigned to this professional" });
      expect(next).not.toHaveBeenCalledWith();
    });
  });

  describe("listInvitations", () => {
    // successful paths
    test("Returns status code 200 and shows the invitations", async () => {
      const req = {
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      const invitations = {
          clientId: TEST_CLIENTID,
          status: "invited"
      }
      
      mockListProfessionalsService.mockResolvedValue(invitations);

      await listInvitations(req,res,next);

      expect(mockListProfessionalsService).toHaveBeenCalledWith({
        clientId: TEST_CLIENTID,
        status: "invited"
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ invitations });
      expect(next).not.toHaveBeenCalledWith();
    });
    // failure paths
    test("Returns error code 400 when client ID is missing or invalid", async () => {
      const req = {
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockListProfessionalsService.mockRejectedValue(new ClientError("Client ID is required"));

      await listInvitations(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Client ID is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 400 when status is invalid", async () =>{
      const req = {
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockListProfessionalsService.mockRejectedValue(new ClientError("Invalid status value"));

      await listInvitations(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid status value" });
      expect(next).not.toHaveBeenCalledWith();
    });
  });

  describe("listSharedRecipes", () => {
    // successful paths
    test("Returns status code 200 and shows the listed recipes", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      const sharedRecipes = {
          professionalId: TEST_PROFESSIONALID,
          clientId: TEST_CLIENTID
      }
      
      mockListSharedRecipesService.mockResolvedValue(sharedRecipes);

      await listSharedRecipes(req,res,next);

      expect(mockListSharedRecipesService).toHaveBeenCalledWith({
        professionalId: TEST_PROFESSIONALID,
        clientId: TEST_CLIENTID
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ sharedRecipes });
      expect(next).not.toHaveBeenCalledWith();
    });
    // failure paths
    test("Returns error code 400 when client ID is missing or invalid", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID_FAIL
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockListSharedRecipesService.mockRejectedValue(new ClientError("Client ID is required"));

      await listSharedRecipes(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Client ID is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 400 when professional ID is missing or invalid", async () => {
      const req = {
        params: {
          professionalId: TEST_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID_FAIL
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockListSharedRecipesService.mockRejectedValue(new ClientError("Professional ID is required"));

      await listSharedRecipes(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Professional ID is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns error code 403 when client is not assigned to the professional", async () => {
      const req = {
        params: {
          professionalId: TEST_OTHER_PROFESSIONALID
        },
        user: {
          userId: TEST_CLIENTID
        }
      };
      const res = createRes();
      const next = jest.fn();
      
      mockListSharedRecipesService.mockRejectedValue(new ClientError("Client is not assigned to this professional"));

      await listSharedRecipes(req,res,next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Client is not assigned to this professional" });
      expect(next).not.toHaveBeenCalledWith();
    });
  });
});