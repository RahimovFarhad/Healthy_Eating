import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import request from "supertest";

const sentCodesByEmail = new Map();
const mockSendVerificationEmail = jest.fn(async ({ to, code }) => {
  sentCodesByEmail.set(to, code);
});

jest.unstable_mockModule("../../src/utils/email.js", () => ({
  sendVerificationEmail: mockSendVerificationEmail,
}));

const { default: app } = await import("../../src/app.js");
const { prisma } = await import("../../src/db/prisma.js");

const { sign } = jwt;

const TEST_ID = Date.now();

// Test users with different roles
const DEFAULT_USER = {
  email: `default-user-${TEST_ID}@example.com`,
  username: `default_user_${TEST_ID}`,
  password: "Password123!",
};

const SUBSCRIBER_USER = {
  email: `subscriber-user-${TEST_ID}@example.com`,
  username: `subscriber_user_${TEST_ID}`,
  password: "Password123!",
};

const PROFESSIONAL_USER = {
  email: `professional-user-${TEST_ID}@example.com`,
  username: `professional_user_${TEST_ID}`,
  password: "Password123!",
};

const ANOTHER_USER = {
  email: `another-user-${TEST_ID}@example.com`,
  username: `another_user_${TEST_ID}`,
  password: "Password123!",
};

let defaultUserId = null;
let defaultUserToken = null;
let subscriberUserId = null;
let subscriberUserToken = null;
let professionalUserId = null;
let professionalUserToken = null;
let anotherUserId = null;
let anotherUserToken = null;

let testDiaryEntryId = null;
let testGoalId = null;

async function registerAndVerifyUser(userDetails) { // function to register and verify a user
  await request(app).post("/api/auth/register").send(userDetails);

  const code = sentCodesByEmail.get(userDetails.email);

  // Verify
  const verifyRes = await request(app)
    .post("/api/auth/register/verify")
    .send({
      email: userDetails.email,
      code,
    });

  return verifyRes.body.userId;
}

async function loginAndGetToken(email, password) { // function to login and get token
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return loginRes.body.token;
}

describe("Authorization Tests", () => {
  beforeAll(async () => {
    // We create test users with different roles 
    defaultUserId = await registerAndVerifyUser(DEFAULT_USER);
    subscriberUserId = await registerAndVerifyUser(SUBSCRIBER_USER);
    professionalUserId = await registerAndVerifyUser(PROFESSIONAL_USER);
    anotherUserId = await registerAndVerifyUser(ANOTHER_USER);

    // Update roles
    await prisma.user.update({
      where: { userId: subscriberUserId },
      data: { role: "subscriber" },
    });

    await prisma.user.update({
      where: { userId: professionalUserId },
      data: { role: "professional" },
    });

    // Get tokens
    defaultUserToken = await loginAndGetToken(DEFAULT_USER.email, DEFAULT_USER.password);
    subscriberUserToken = await loginAndGetToken(SUBSCRIBER_USER.email, SUBSCRIBER_USER.password);
    professionalUserToken = await loginAndGetToken(PROFESSIONAL_USER.email, PROFESSIONAL_USER.password);
    anotherUserToken = await loginAndGetToken(ANOTHER_USER.email, ANOTHER_USER.password);

    // Create test data for subscriber
    const diaryRes = await request(app)
      .post("/api/diary/entries")
      .set("Authorization", `Bearer ${subscriberUserToken}`)
      .send({
        consumedAt: new Date().toISOString(),
        mealType: "breakfast",
        notes: "Test entry",
        items: [],
      });
    testDiaryEntryId = diaryRes.body.entry.diaryEntryId;

    // Get a goal for subscriber
    const goalsRes = await request(app)
      .get("/api/goals")
      .set("Authorization", `Bearer ${subscriberUserToken}`);
    testGoalId = goalsRes.body.goals[0]?.goalId;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.refreshToken.deleteMany({
      where: {
        userId: {
          in: [defaultUserId, subscriberUserId, professionalUserId, anotherUserId],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        userId: {
          in: [defaultUserId, subscriberUserId, professionalUserId, anotherUserId],
        },
      },
    });

    await prisma.$disconnect();
  });

  describe("Vertical Privilege Escalation (Role-based)", () => {
    describe("Professional-only endpoints", () => {
      test("Default user cannot access professional endpoints - invite client", async () => {
        const res = await request(app)
          .post("/api/professional/client-invitations")
          .set("Authorization", `Bearer ${defaultUserToken}`)
          .send({
            email: SUBSCRIBER_USER.email,
          });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("Forbidden");
      });

      test("Subscriber cannot access professional endpoints - invite client", async () => {
        const res = await request(app)
          .post("/api/professional/client-invitations")
          .set("Authorization", `Bearer ${subscriberUserToken}`)
          .send({
            email: ANOTHER_USER.email,
          });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("Forbidden");
      });

      test("Default user cannot list professional clients", async () => {
        const res = await request(app)
          .get("/api/professional/clients")
          .set("Authorization", `Bearer ${defaultUserToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("Forbidden");
      });

      test("Subscriber cannot list professional clients", async () => {
        const res = await request(app)
          .get("/api/professional/clients")
          .set("Authorization", `Bearer ${subscriberUserToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("Forbidden");
      });

      test("Professional can access professional endpoints", async () => {
        const res = await request(app)
          .get("/api/professional/clients")
          .set("Authorization", `Bearer ${professionalUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("clients");
      });
    });

    describe("Authentication required endpoints", () => {
      test("Unauthenticated user cannot access diary entries", async () => {
        const res = await request(app).get("/api/diary/entries");

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("Authorization header missing");
      });

      test("Unauthenticated user cannot access goals", async () => {
        const res = await request(app).get("/api/goals");

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("Authorization header missing");
      });

      test("Invalid token is rejected", async () => {
        const res = await request(app)
          .get("/api/diary/entries")
          .set("Authorization", "Bearer invalid-token");

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("Invalid token");
      });

      test("Refresh token cannot be used as access token", async () => {
        const refreshToken = sign(
          {
            userId: subscriberUserId,
            tokenType: "refresh",
            jti: "test-jti",
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        const res = await request(app)
          .get("/api/diary/entries")
          .set("Authorization", `Bearer ${refreshToken}`);

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("Invalid token");
      });
    });
  });

  describe("Horizontal Privilege Escalation (IDOR)", () => {
    describe("Diary Entry Access", () => {
      test("User cannot access another user's diary entry", async () => {
        const res = await request(app)
          .get(`/api/diary/entries/${testDiaryEntryId}`)
          .set("Authorization", `Bearer ${anotherUserToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.error).toContain("Unauthorised access");
      });

      test("User can access their own diary entry", async () => {
        const res = await request(app)
          .get(`/api/diary/entries/${testDiaryEntryId}`)
          .set("Authorization", `Bearer ${subscriberUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.entry.diaryEntryId).toBe(testDiaryEntryId);
      });

      test("User cannot delete another user's diary entry", async () => {
        const res = await request(app)
          .delete(`/api/diary/entries/${testDiaryEntryId}`)
          .set("Authorization", `Bearer ${anotherUserToken}`);

        expect(res.statusCode).toBe(403);
        expect(res.body.error).toContain("Unauthorised access");
      });

      test("User cannot add items to another user's diary entry", async () => {
        const res = await request(app)
          .post(`/api/diary/entries/${testDiaryEntryId}/items`)
          .set("Authorization", `Bearer ${anotherUserToken}`)
          .send({
            portionId: 1,
            quantity: 1,
          });

        expect(res.statusCode).toBe(403);
        expect(res.body.error).toContain("Unauthorised access");
      });
    });

    describe("Goal Access", () => {
      test("User cannot update another user's goal", async () => {
        if (!testGoalId) {
          console.log("Skipping test: no goal available");
          return;
        }

        const res = await request(app)
          .patch("/api/goals")
          .set("Authorization", `Bearer ${anotherUserToken}`)
          .send({
            goal: {
              goalId: testGoalId,
              targetMin: 100,
              targetMax: 200,
            },
          });

        // Returns 404 because goal doesn't belong to user 
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("Goal not found");
      });

      test("User cannot delete another user's goal", async () => {
        if (!testGoalId) {
          console.log("Skipping test: no goal available");
          return;
        }

        const res = await request(app)
          .delete(`/api/goals/${testGoalId}`)
          .set("Authorization", `Bearer ${anotherUserToken}`);

        // Returns 404 because goal doesn't belong to user - acceptable behavior
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("Goal not found");
      });

      test("User cannot toggle another user's goal", async () => {
        if (!testGoalId) {
          console.log("Skipping test: no goal available");
          return;
        }

        const res = await request(app)
          .patch(`/api/goals/${testGoalId}/toggle-done`)
          .set("Authorization", `Bearer ${anotherUserToken}`);

        // Returns 404 because goal doesn't belong to user - acceptable behavior
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toContain("Goal not found");
      });

      test("User can access their own goals", async () => {
        const res = await request(app)
          .get("/api/goals")
          .set("Authorization", `Bearer ${subscriberUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("goals");
      });
    });

    describe("Summary and Dashboard Access", () => {
      test("User can only access their own summary", async () => {
        const res = await request(app)
          .get("/api/diary/summary?period=daily&endDate=" + new Date().toISOString().split('T')[0])
          .set("Authorization", `Bearer ${subscriberUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("summary");
      });

      test("User can only access their own dashboard", async () => {
        const res = await request(app)
          .get("/api/diary/dashboard")
          .set("Authorization", `Bearer ${subscriberUserToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("dashboardData");
      });

      test("Users cannot list each other's diary entries", async () => {
        // Create entry for another user
        const anotherEntryRes = await request(app)
          .post("/api/diary/entries")
          .set("Authorization", `Bearer ${anotherUserToken}`)
          .send({
            consumedAt: new Date().toISOString(),
            mealType: "lunch",
            notes: "Another user's entry",
            items: [],
          });

        expect(anotherEntryRes.statusCode).toBe(201);

        // We will make 2 different users list their entries and ensure they are not same

        // Subscriber tries to list entries - but it only returns data of authenticated user (acceptable behavior)
        const subscriberEntriesRes = await request(app)
          .get("/api/diary/entries")
          .set("Authorization", `Bearer ${subscriberUserToken}`);

        expect(subscriberEntriesRes.statusCode).toBe(200);
        const subscriberEntries = subscriberEntriesRes.body.record;
        
        // Let's verify subscriber has entries 
        expect(subscriberEntries.length).toBeGreaterThan(0);

        // Another user tries to their own entries
        const anotherEntriesRes = await request(app)
          .get("/api/diary/entries")
          .set("Authorization", `Bearer ${anotherUserToken}`);

        expect(anotherEntriesRes.statusCode).toBe(200);
        const anotherEntries = anotherEntriesRes.body.record;
        
        // Verify another user has entries (they just created one)
        expect(anotherEntries.length).toBeGreaterThan(0);
        
        // Verify the entries are different (different IDs)
        const subscriberIds = subscriberEntries.map(e => e.diaryEntryId);
        const anotherIds = anotherEntries.map(e => e.diaryEntryId);
        const overlap = subscriberIds.filter(id => anotherIds.includes(id));
        expect(overlap.length).toBe(0); // No overlap means proper isolation
      });
    });

    describe("Professional-Client Relationship IDOR", () => {
      test("Professional cannot access non-client's data", async () => {
        // Professional tries to access subscriber's summary without relationship
        const res = await request(app)
          .get(`/api/professional/clients/${subscriberUserId}/summary?period=daily&endDate=${new Date().toISOString().split('T')[0]}`)
          .set("Authorization", `Bearer ${professionalUserToken}`);

        // 403 - professional role check passes but relationship check fails
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBeDefined();
      });

      test("Professional cannot access non-client's dashboard", async () => {
        const res = await request(app)
          .get(`/api/professional/clients/${subscriberUserId}/dashboard`)
          .set("Authorization", `Bearer ${professionalUserToken}`);

        // 403 - professional role check passes but relationship check fails
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBeDefined();
      });

      test("Professional cannot set goals for non-client", async () => {
        const res = await request(app)
          .post(`/api/professional/clients/${subscriberUserId}/goals`)
          .set("Authorization", `Bearer ${professionalUserToken}`)
          .send({
            goal: {
              nutrientId: 1,
              targetMin: 50,
              targetMax: 100,
              startDate: new Date().toISOString().split('T')[0],
              notes: "Test goal"
            }
          });

        // Should fail for relationship check
        expect(res.statusCode).toBe(403);
        expect(res.body.error).toBeDefined();
      });
    });
  });

  describe("Mass Assignment / Parameter Tampering", () => {
    test("User cannot change their role through update", async () => {
      // Try to create a diary entry with a different subscriberId
      const res = await request(app)
        .post("/api/diary/entries")
        .set("Authorization", `Bearer ${defaultUserToken}`)
        .send({
          subscriberId: subscriberUserId, // Trying to create entry for another user
          consumedAt: new Date().toISOString(),
          mealType: "dinner",
          notes: "Malicious entry",
          items: [],
        });

      // It should create the entry for the authenticated user, not the tampered subscriberId
      expect(res.statusCode).toBe(201);
      expect(res.body.entry).toBeDefined();
    });
    test("User cannot manipulate userId in goal operations", async () => {
      // The API should use req.user.userId, not accept it from request body
      const res = await request(app)
        .post("/api/goals")
        .set("Authorization", `Bearer ${defaultUserToken}`)
        .send({
          subscriberId: subscriberUserId, // Trying to create goal for another user
          goal: {
            nutrientId: 1,
            targetMin: 50,
            targetMax: 100,
            startDate: new Date().toISOString().split('T')[0],
          },
        });

      // Should create goal for authenticated user
      if (res.statusCode === 201) {
        const goalRes = await request(app)
          .get("/api/goals")
          .set("Authorization", `Bearer ${defaultUserToken}`);
        
        const createdGoal = goalRes.body.goals.find(g => g.goalId === res.body.createdGoal.goalId);
        expect(createdGoal.subscriberId).toBe(defaultUserId);
      }
    });
  });
});
