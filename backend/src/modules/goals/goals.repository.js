import { prisma } from "../../db/prisma.js";

const GOAL_SELECT = {
  goalId: true,
  subscriberId: true,
  nutrientId: true,
  source: true,
  status: true,
  targetMin: true,
  targetMax: true,
  setByProfessionalId: true,
  startDate: true,
  endDate: true,
  notes: true,
  createdAt: true,
  nutrient: {
    select: {
      nutrientId: true,
      code: true,
      name: true,
      unit: true,
      type: true,
    },
  },
};

function toDateOnly(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

async function fetchGoals({ subscriberId, effective, include = "none" }) {
  const today = new Date();
  const where = {
    subscriberId,
    ...(effective
      ? {
          status: "active",
          startDate: { lte: today },
          OR: [{ endDate: null }, { endDate: { gte: today } }],
        }
      : {}),
  };

  return prisma.nutritionGoal.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { goalId: "desc" }], // for select, if include = "today" or "all" have checkin(s)
    select: { ...GOAL_SELECT,
      ...(include != "none"
        ? {
            checkIns: {
              ...(include === "today" && { where: { date: toDateOnly() } }),
              select: {
                checkInId: true,
                date: true,
                isDone: true,
              },
            },
          }
        : {}),
     },
  });
}

async function findNutrientById({ nutrientId }) {
  return prisma.nutrient.findUnique({
    where: { nutrientId },
    select: { nutrientId: true },
  });
}

async function findNutrientByCode({ nutrientCode }) {
  return prisma.nutrient.findUnique({
    where: { code: nutrientCode },
    select: { nutrientId: true },
  });
}

async function listNutrients() {
  return prisma.nutrient.findMany({
    orderBy: [{ type: "asc" }, { nutrientId: "asc" }],
    select: {
      nutrientId: true,
      code: true,
      name: true,
      unit: true,
      type: true,
    },
  });
}

async function findGoalByIdForSubscriber({ subscriberId, goalId }) {
  return prisma.nutritionGoal.findFirst({
    where: {
      goalId,
      subscriberId,
    },
    select: { 
      goalId: true, 
      status: true,
      startDate: true,
      endDate: true,
      subscriber: {
        select: {
          userId: true,
        },
      },
    },
  });
}

async function archiveGoal({ goalId, archivedAt }) {
  return prisma.nutritionGoal.update({
    where: { goalId },
    data: {
      status: "archived",
      endDate: archivedAt,
    },
    select: GOAL_SELECT,
  });
}

async function updateGoal({ goalId, data }) {
  return prisma.nutritionGoal.update({
    where: { goalId },
    data,
    select: GOAL_SELECT,
  });
}

async function insertGoal({
  subscriberId,
  nutrientId,
  source,
  status,
  targetMin,
  targetMax,
  setByProfessionalId,
  startDate,
  endDate,
  notes,
}) {
  return prisma.nutritionGoal.create({
    data: {
      subscriberId,
      nutrientId,
      source,
      status,
      targetMin,
      targetMax,
      setByProfessionalId,
      startDate,
      endDate,
      notes,
    },
    select: {
      ...GOAL_SELECT, 
      setByProfessionalId: true, 
    }
      
  });
}

async function findGuidelinesByDemographic(demographic, tx) {
  const client = tx ?? prisma;
  return client.guideline.findMany({
    where: { demographic },
    select: {
      nutrientId: true,
      minValue: true,
      maxValue: true,
    },
  });
}

async function createManyGoals(rows, tx) {
  const client = tx ?? prisma;
  return client.nutritionGoal.createMany({ data: rows });
}

async function findGoalCheckInByDate({ goalId, date }) {
  return prisma.goalCheckIn.findUnique({
    where: {
      goalId_date: {
        goalId,
        date,
      },
    },
    select: {
      checkInId: true,
      goalId: true,
      date: true,
      isDone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function createGoalCheckIn({ goalId, date, isDone = true }) {
  return prisma.goalCheckIn.create({
    data: {
      goalId,
      date,
      isDone,
    },
    select: {
      checkInId: true,
      goalId: true,
      date: true,
      isDone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function updateGoalCheckIn({ checkInId, isDone }) {
  return prisma.goalCheckIn.update({
    where: { checkInId },
    data: { isDone },
    select: {
      checkInId: true,
      goalId: true,
      date: true,
      isDone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export {
  fetchGoals,
  findNutrientById,
  findNutrientByCode,
  listNutrients,
  findGoalByIdForSubscriber,
  archiveGoal,
  updateGoal,
  insertGoal,
  findGuidelinesByDemographic,
  createManyGoals,
  findGoalCheckInByDate,
  createGoalCheckIn,
  updateGoalCheckIn,
};
