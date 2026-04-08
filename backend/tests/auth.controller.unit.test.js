import {expect, jest} from "@jest/globals";
import { AuthError } from "../src/modules/auth/auth.service";

class mockAuthError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
};

class mockUserNotFoundError extends AuthError {
    constructor() {
        super("User not found");
        this.name = "UserNotFoundError";
    }
};

const TEST_ID = Date.now();
const TEST_USER = {
  email: `test-${TEST_ID}@example.com`,
  username: `test-${TEST_ID}`,
  password: "Password123!",
};

const mockAuthenticateUser = jest.fn();
const mockGenerateRefreshToken = jest.fn();

jest.unstable_mockModule("../src/modules/auth/auth.service.js", () => ({
  authenticateUser: mockAuthenticateUser,
  generateRefreshToken: mockGenerateRefreshToken,
  AuthError: mockAuthError,
  UserNotFoundError: mockUserNotFoundError,
  registerUser: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

const { login, register, refreshToken } = await import("../src/modules/auth/auth.controller.js");

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
}

describe("Authentication Controller", () => {
  describe("Login", () => {
    test("Returns error code 400 when email is missing", async () => {
      const req = {
        body: {
          password: TEST_USER.password
        }
      };
      const res = createRes();
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email and password are required" });
    });
    test("Returns error code 400 when password is missing", async () => {
      const req = {
        body: {
          email: TEST_USER.email
        }
      };
      const res = createRes();
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email and password are required" });
    });
    
    test("Returns access token and refresh cookie on successful login", async () => {
      mockAuthenticateUser.mockResolvedValue("mock.jwt.token");
      mockGenerateRefreshToken.mockResolvedValue("mock.refresh.token");
      const req = {
        body: {
          email: TEST_USER.email,
          password: TEST_USER.password
        }
      };
      const res = createRes();
      
      await login(req, res);
      
      expect(mockAuthenticateUser).toHaveBeenCalledWith(TEST_USER.email, TEST_USER.password);
      expect(mockGenerateRefreshToken).toHaveBeenCalledWith(TEST_USER.email);
      expect(res.cookie).toHaveBeenCalledWith("refreshToken", "mock.refresh.token", expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({ message: "Login successful", token: "mock.jwt.token" });

    });
    test("Returns error code 404 when user is not found", async () => {
      mockAuthenticateUser.mockRejectedValue(new mockUserNotFoundError());
      const req = {
        body: {
          email: TEST_USER.email,
          password: TEST_USER.password
        }
      };
      const res = createRes();
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
    test("Returns error code 401 when password is invalid", async () => {
      mockAuthenticateUser.mockRejectedValue(new mockAuthError("Invalid credentials"));
      const req = {
        body: {
          email: TEST_USER.email,
          password: TEST_USER.password
        }
      };
      const res = createRes();
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

  });

  describe("Register", () => {
    
  });

  describe("Refresh Token", () => {
    
  });


});

