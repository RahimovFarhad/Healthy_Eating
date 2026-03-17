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

async function fetchGoals({ subscriberId, effective }) {
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
    orderBy: [{ createdAt: "desc" }, { goalId: "desc" }],
    select: GOAL_SELECT,
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

async function findGoalByIdForSubscriber({ subscriberId, goalId }) {
  return prisma.nutritionGoal.findFirst({
    where: {
      goalId,
      subscriberId,
    },
    select: { 
      goalId: true, 
      status: true, 
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
    select: GOAL_SELECT,
  });
}

export {
  fetchGoals,
  findNutrientById,
  findNutrientByCode,
  findGoalByIdForSubscriber,
  archiveGoal,
  updateGoal,
  insertGoal,
};
