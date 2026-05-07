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
});
