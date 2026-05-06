import {expect, jest} from "@jest/globals";
import { AuthError } from "../../src/modules/auth/auth.service.js";

class mockAuthError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthError";
    }
}

class mockUserNotFoundError extends AuthError {
    constructor() {
        super("User not found");
        this.name = "UserNotFoundError";
    }
}

const TEST_ID = Date.now();
const TEST_USER = {
  email: `test-${TEST_ID}@example.com`,
  username: `test-${TEST_ID}`,
  password: "Password123!",
};

const mockAuthenticateUser = jest.fn();
const mockGenerateRefreshToken = jest.fn();
const mockRegisterUser = jest.fn();
const mockRefreshToken = jest.fn();
const mockVerifyRegistrationCode = jest.fn();
const mockResendRegistrationCode = jest.fn();

jest.unstable_mockModule("../../src/modules/auth/auth.service.js", () => ({
  authenticateUser: mockAuthenticateUser,
  generateRefreshToken: mockGenerateRefreshToken,
  AuthError: mockAuthError,
  UserNotFoundError: mockUserNotFoundError,
  registerUser: mockRegisterUser,
  verifyRegistrationCode: mockVerifyRegistrationCode,
  resendRegistrationCode: mockResendRegistrationCode,
  refreshAccessToken: mockRefreshToken,
}));

const { login, register, verifyRegistration, resendVerificationCode, refreshToken } = await import("../../src/modules/auth/auth.controller.js");

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
    test("Returns 500 on unexpected error", async () => {
      const req = {
        body: {
          email: "user@example.com",
          password: "Password123!",
        },
      };
      const res = createRes(); 

      mockAuthenticateUser.mockRejectedValue(new Error("db exploded")); // We create a generic error that is not an instance of AuthError to simulate an unexpected error in the service layer

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });

  });

  describe("Register", () => {
    test("Returns error code 400 when email is missing", async () => {
      const req = {
        body: {
          password: TEST_USER.password,
          username: TEST_USER.username
        }
      };
      const res = createRes();
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email, username, and password are required" });
    });
    test("Returns error code 400 when password is missing", async () => {
      const req = {
        body: {
          email: TEST_USER.email,
          username: TEST_USER.username
        }
      };
      const res = createRes();
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email, username, and password are required" });
    });
    test("Returns error code 400 when username is missing", async () => {
      const req = {
        body: {
          email: TEST_USER.email,
          password: TEST_USER.password
        }
      };
      const res = createRes();
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email, username, and password are required" });
    });
    test("Returns error code 400 when body is empty", async () => {
      const req = {
        body: {}
      };
      const res = createRes();
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email, username, and password are required" });
    });
    test("Returns verification message on success", async () => {
      const req = {
        body: {
          email: TEST_USER.email,
          username: TEST_USER.username,
          password: TEST_USER.password
        }
      };
      const res = createRes();

      mockRegisterUser.mockResolvedValue({ email: TEST_USER.email });
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Verification code sent. Complete verification to finish registration."
      });
    });

    test("Resturns error code 409 when email already in use", async () => {
      mockRegisterUser.mockRejectedValue(new mockAuthError("Email already in use"));
      const req = {
        body: {
          email: TEST_USER.email,
          username: TEST_USER.username,
          password: TEST_USER.password
        }
      };
      const res = createRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Email already in use" });
    });

    test("Resturns error code 409 when username already in use", async () => {
      mockRegisterUser.mockRejectedValue(new mockAuthError("Username already in use"));
      const req = {
        body: {
          email: TEST_USER.email,
          username: TEST_USER.username,
          password: TEST_USER.password
        }
      };
      const res = createRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Username already in use" });
    });

    test("Returns 500 on unexpected error", async () => {
      const req = {
        body: {
          email: "user@example.com",
          username: "user1",
          password: "Password123!",
        },
      };
      const res = createRes(); 

      mockRegisterUser.mockRejectedValue(new Error("db exploded")); // We create a generic error that is not an instance of AuthError to simulate an unexpected error in the service layer

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });


  });

  describe("Refresh Token", () => {
    test("Returns error code 401 when req.cookies missing", async() => {
      const req = {};
      const res = createRes();

      await refreshToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Refresh token is required",
      });
    });
    test("Returns error code 401 when refresh token is missing", async() => {
      const req = {
        cookies: {}
      };
      const res = createRes();

      await refreshToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Refresh token is required",
      });
    });
    test("Returns error code 401 when refresh token is invalid", async() => {
      const req = {
        cookies: {
          refreshToken: "invalid.refresh.token"
        }
      };
      const res = createRes();
      mockRefreshToken.mockRejectedValue(new mockAuthError("Invalid refresh token"));

      await refreshToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid refresh token",
      });
    });
    test("Returns access token on success", async() => {
      const req = {
        cookies: {
          refreshToken: "mock.refresh.token"
        }
      };
      const res = createRes();
      mockRefreshToken.mockResolvedValue("new.mock.jwt.token");

      await refreshToken(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Token refreshed successfully",
        token: "new.mock.jwt.token"
      }));
    });
    
  });

  describe("Verify Registration", () => {
    test("Returns error code 400 when email is missing", async () => {
      const req = { body: { code: "123456" } };
      const res = createRes();

      await verifyRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email and code are required" });
    });

    test("Returns status 201 and userId on success", async () => {
      const req = { body: { email: TEST_USER.email, code: "123456" } };
      const res = createRes();
      mockVerifyRegistrationCode.mockResolvedValue({ userId: 321 });

      await verifyRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
        userId: 321,
      });
    });

    test("Returns error code 409 when email already in use", async () => {
      const req = { body: { email: TEST_USER.email, code: "123456" } };
      const res = createRes();
      mockVerifyRegistrationCode.mockRejectedValue(new mockAuthError("Email already in use"));

      await verifyRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Email already in use" });
    });
  });

  describe("Resend Verification Code", () => {
    test("Returns error code 400 when email is missing", async () => {
      const req = { body: {} };
      const res = createRes();

      await resendVerificationCode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email is required" });
    });

    test("Returns success when resend is accepted", async () => {
      const req = { body: { email: TEST_USER.email } };
      const res = createRes();
      mockResendRegistrationCode.mockResolvedValue({ email: TEST_USER.email });

      await resendVerificationCode(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Verification code resent successfully." });
    });
  });

});
