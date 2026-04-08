import jest from "jest";
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

jest.mock("./auth.service.js", () => ({
  authenticateUser: mockAuthenticateUser,
  generateRefreshToken: mockGenerateRefreshToken,
  AuthError: mockAuthError,
  UserNotFoundError: mockUserNotFoundError,
  registerUser: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

const { login, register, refreshToken } = await import("./auth.controller.js");

describe("Authentication Controller", () => {
  describe("Login", () => {


  });

  describe("Register", () => {
    
  });
  
  describe("Refresh Token", () => {
    
  });


});

