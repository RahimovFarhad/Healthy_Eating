import { expect, jest } from "@jest/globals";

const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockPendingUpsert = jest.fn();
const mockVerifyPassword = jest.fn();
const mockHashPassword = jest.fn();
const mockSendVerificationEmail = jest.fn();
const mockSign = jest.fn();
const mockVerify = jest.fn();
const mockTx = jest.fn();

const TEST_ID = Math.floor(Math.random() * 100000);

jest.unstable_mockModule("../../src/db/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
    },
    pendingRegistration: {
      upsert: mockPendingUpsert,
    },
    $transaction: mockTx,
  },
}));

jest.unstable_mockModule("../../src/utils/hash.js", () => ({
  hashPassword: mockHashPassword,
  verifyPassword: mockVerifyPassword,
}));

jest.unstable_mockModule("../../src/utils/email.js", () => ({
  sendVerificationEmail: mockSendVerificationEmail,
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: mockSign,
    verify: mockVerify,
  },
}));

jest.unstable_mockModule("../../src/modules/goals/goals.service.js", () => ({
  ensureDefaultGoalsForUser: jest.fn(),
}));

const { authenticateUser, registerUser, generateRefreshToken,refreshAccessToken, AuthError, UserNotFoundError } = await import(
  "../../src/modules/auth/auth.service.js"
);

describe("Authentication Service", () => {
  describe("authenticateUser (unit)", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      process.env.JWT_SECRET = "unit-test-secret";
    });

    test("throws UserNotFoundError the user doesn't exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        authenticateUser("missing@example.com", "Password123!")
      ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    test("throws AuthError when the password is invalid", async () => {
      expect.assertions(2);

      mockFindUnique.mockResolvedValue({
        userId: 1,
        email: "user@example.com",
        role: "default",
        passwordHash: "hashed-password",
      });
      mockVerifyPassword.mockResolvedValue(false);

      try {
        await authenticateUser("user@example.com", "wrong-password");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect(error.message).toBe("Invalid credentials");
      }
    });

    test("returns signed access token if valid credentials", async () => {
      mockFindUnique.mockResolvedValue({
        userId: 7,
        email: "valid@example.com",
        role: "default",
        passwordHash: "hashed-password",
      });
      mockVerifyPassword.mockResolvedValue(true);
      mockSign.mockReturnValue("mock.jwt.token");

      const token = await authenticateUser("valid@example.com", "Password123!");

      expect(token).toBe("mock.jwt.token");
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: "valid@example.com" },
      });
      expect(mockVerifyPassword).toHaveBeenCalledWith(
        "Password123!",
        "hashed-password"
      );
      expect(mockSign).toHaveBeenCalledWith(
        {
          userId: 7,
          email: "valid@example.com",
          role: "default",
          tokenType: "access",
        },
        "unit-test-secret",
        { expiresIn: "1h" }
      );
    });
  });

  describe("registerUser (unit)", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      process.env.JWT_SECRET = "unit-test-secret";
    });
    const TEST_USER = {
      email: `auth-int-${TEST_ID}@example.com`,
      username: `auth_integration_user_${TEST_ID}`,
      password: "Password123!", // has both uppercase, lowercase, number, and special char, and is between 8-30 chars
    };

    test("throws AuthError when email already exists", async () => {
      expect.assertions(2);
      mockFindFirst.mockResolvedValue({
        userId: 1,
        email: TEST_USER.email,
        fullName: "Different_Name",
      });

      try {
        await registerUser(TEST_USER.email, TEST_USER.username, TEST_USER.password);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect(error.message).toBe("Email already in use");
      }
    });

    test("throws AuthError when email format is invalid", async () => {
      await expect(
        registerUser("invalid-email", TEST_USER.username, TEST_USER.password)
      ).rejects.toEqual(expect.objectContaining({
        message: "Please enter a valid email address",
      }));
    });

    test("throws AuthError when password is shorter than 8 chars", async () => {
      await expect(
        registerUser(TEST_USER.email, TEST_USER.username, "short1")
      ).rejects.toEqual(expect.objectContaining({
        message: "Password must be at least 8 characters",
      }));
    });

    test("throws AuthError when password is longer than 30 chars", async () => {
      await expect(
        registerUser(
          TEST_USER.email,
          TEST_USER.username,
          "12345678901234567890123456789012345678901234567890!"
        )
      ).rejects.toEqual(expect.objectContaining({
        message: "Password must be 30 characters or fewer",
      }));
    });

    test("throws AuthError when username already exists", async () => {
      expect.assertions(2);
      mockFindFirst.mockResolvedValue({
        userId: 1,
        email: "Differemt_Email",
        fullName: TEST_USER.username,
      });

      try {
        await registerUser(TEST_USER.email, TEST_USER.username, TEST_USER.password);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect(error.message).toBe("Username already in use");
      }
    });

    test("stores pending registration and sends verification code for valid credentials", async () => {
      mockFindFirst.mockResolvedValue(null);
      mockHashPassword
        .mockResolvedValueOnce("hashed-password")
        .mockResolvedValueOnce("hashed-code");
      mockPendingUpsert.mockResolvedValue({});
      mockSendVerificationEmail.mockResolvedValue({});
      
      const newUser = await registerUser(TEST_USER.email, TEST_USER.username, TEST_USER.password); 
      expect(newUser).toEqual({
        email: TEST_USER.email,
      });
      expect(mockPendingUpsert).toHaveBeenCalled();
      expect(mockPendingUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: TEST_USER.email },
          create: expect.objectContaining({
            email: TEST_USER.email,
            fullName: TEST_USER.username,
            attemptCount: 0,
          }),
          update: expect.objectContaining({
            attemptCount: 0,
          }),
        })
      );
      expect(mockSendVerificationEmail).toHaveBeenCalledWith({
        to: TEST_USER.email,
        code: expect.stringMatching(/^\d{6}$/),
      });
    });

  });

  describe("generateRefreshToken (unit)", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      process.env.JWT_SECRET = "unit-test-secret";
    });

    test("throws UserNotFoundError when user does not exist", async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        generateRefreshToken("missing@example.com")
      ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    test("returns signed refresh token for existing user", async () => {
      mockFindUnique.mockResolvedValue({
        userId: 10,
        email: "refresh@example.com",
        role: "default",
      });
      mockSign.mockReturnValue("mock.refresh.token");

      const token = await generateRefreshToken("refresh@example.com");

      expect(token).toBe("mock.refresh.token");
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: "refresh@example.com" },
      });
      expect(mockSign).toHaveBeenCalledWith(
        {
          userId: 10,
          tokenType: "refresh",
        },
        "unit-test-secret",
        { expiresIn: "7d" }
      );
      expect(token).toBe("mock.refresh.token");
    });
  });

  describe("refreshAccessToken (unit)", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      process.env.JWT_SECRET = "unit-test-secret";
    });

    test("throws AuthError when token is invalid", async () => {
      mockVerify.mockImplementation(() => {
        throw new Error("jwt invalid");
      });

      await expect(refreshAccessToken("invalid.token")).rejects.toEqual(
        expect.objectContaining({
          message: "Invalid refresh token",
        })
      );
    });

    test("throws AuthError when token type is not refresh", async () => {
      mockVerify.mockReturnValue({
        userId: 7,
        tokenType: "access",
      });

      await expect(refreshAccessToken("access.token")).rejects.toEqual(
        expect.objectContaining({
          message: "Invalid refresh token",
        })
      );
    });

    test("returns signed access token for valid refresh token", async () => {
      mockVerify.mockReturnValue({
        userId: 7,
        tokenType: "refresh",
      });
      mockFindUnique.mockResolvedValue({
        userId: 7,
        email: "valid@example.com",
        role: "default",
      });
      mockSign.mockReturnValue("mock.new.access.token");

      const token = await refreshAccessToken("valid.refresh.token");

      expect(token).toBe("mock.new.access.token");
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { userId: 7 },
      });
      expect(mockSign).toHaveBeenCalledWith(
        {
          userId: 7,
          email: "valid@example.com",
          role: "default",
          tokenType: "access",
        },
        "unit-test-secret",
        { expiresIn: "1h" }
      );
    });
  });
});
