import { expect, jest } from "@jest/globals";

const mockFindUnique = jest.fn();
const mockFindFirst = jest.fn();
const mockVerifyPassword = jest.fn();
const mockSign = jest.fn();
const mockVerify = jest.fn();
const mockTx = jest.fn();

const TEST_ID = Math.floor(Math.random() * 100000);

jest.unstable_mockModule("../src/db/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      findFirst: mockFindFirst,
    },
    $transaction: mockTx,
  },
}));

jest.unstable_mockModule("../src/utils/hash.js", () => ({
  hashPassword: jest.fn(),
  verifyPassword: mockVerifyPassword,
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: mockSign,
    verify: mockVerify,
  },
}));

jest.unstable_mockModule("../src/modules/goals/goals.service.js", () => ({
  ensureDefaultGoalsForUser: jest.fn(),
}));

const { authenticateUser, registerUser, generateRefreshToken,refreshAccessToken, AuthError, UserNotFoundError } = await import(
  "../src/modules/auth/auth.service.js"
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
      password: "Password123!",
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

    test("returns newUser for valid credentials", async () => {
      mockFindFirst.mockResolvedValue(null);
      mockTx.mockImplementation(async (callback) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue({
              userId: 42,
              email: TEST_USER.email,
              fullName: TEST_USER.username,
            }),
          },
        });
      });
      
      const newUser = await registerUser(TEST_USER.email, TEST_USER.username, TEST_USER.password); 
      expect(newUser).toEqual({
        userId: 42,
        email: TEST_USER.email,
        fullName: TEST_USER.username,
      });
    });

  });



  
});
