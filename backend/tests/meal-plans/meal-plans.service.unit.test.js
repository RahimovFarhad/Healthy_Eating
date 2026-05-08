import { jest, expect } from "@jest/globals";
import { MealPlanError } from "../../src/modules/mealPlans/mealPlans.validator.js";

const createMealPlan = jest.fn();
const listMealPlans = jest.fn();
const getMealPlanById = jest.fn();
const deleteMealPlan = jest.fn();
const addPlanItem = jest.fn();
const removePlanItem = jest.fn();

jest.unstable_mockModule("../../src/modules/mealPlans/mealPlans.repository.js", () => ({
  createMealPlan,
  listMealPlans,
  getMealPlanById,
  deleteMealPlan,
  addPlanItem,
  removePlanItem,
}));

const {
  createMealPlanService,
  listMealPlansService,
  getMealPlanByIdService,
  addPlanItemService,
  deleteMealPlanService,
  removePlanItemService,
} = await import("../../src/modules/mealPlans/mealPlans.service.js");

describe("Meal Plans Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createMealPlanService", () => {
    test("creates a meal plan when input is valid", async () => {
      const mealPlan = {
        planId: 1,
        subscriberId: 2,
        planType: "manual",
      };

      createMealPlan.mockResolvedValue(mealPlan);

      const result = await createMealPlanService({
        subscriberId: "2",
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: "manual",
        items: [
          {
            plannedDate: "2026-05-02",
            mealType: "breakfast",
            recipeId: "3",
            servings: "1",
          },
        ],
      });

      expect(createMealPlan).toHaveBeenCalledWith({
        subscriberId: 2,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        planType: "manual",
        items: [
          {
            plannedDate: expect.any(Date),
            mealType: "breakfast",
            recipeId: 3,
            servings: 1,
          },
        ],
      });
      expect(result).toEqual(mealPlan);
    });

    test("throws MealPlanError when input is invalid", async () => {
      await expect(
        createMealPlanService({
          subscriberId: null,
          startDate: "2026-05-01",
          endDate: "2026-05-07",
          planType: "manual",
          items: [],
        })
      ).rejects.toThrow(MealPlanError);

      expect(createMealPlan).not.toHaveBeenCalled();
    });
  });

  describe("listMealPlansService", () => {
    test("lists meal plans when input is valid", async () => {
      const mealPlans = [
        {
          planId: 1,
          subscriberId: 2,
        },
      ];

      listMealPlans.mockResolvedValue(mealPlans);

      const result = await listMealPlansService({
        subscriberId: "2",
        startDate: "2026-05-01",
        endDate: "2026-05-07",
      });

      expect(listMealPlans).toHaveBeenCalledWith({
        subscriberId: 2,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
      expect(result).toEqual(mealPlans);
    });

    test("throws MealPlanError when subscriberId is invalid", async () => {
      await expect(
        listMealPlansService({
          subscriberId: 0,
        })
      ).rejects.toThrow(MealPlanError);

      expect(listMealPlans).not.toHaveBeenCalled();
    });
  });

  describe("getMealPlanByIdService", () => {
    test("gets a meal plan by id when input is valid", async () => {
      const mealPlan = {
        planId: 1,
        subscriberId: 2,
      };

      getMealPlanById.mockResolvedValue(mealPlan);

      const result = await getMealPlanByIdService({
        planId: "1",
        subscriberId: "2",
      });

      expect(getMealPlanById).toHaveBeenCalledWith({
        planId: 1,
        subscriberId: 2,
      });
      expect(result).toEqual(mealPlan);
    });

    test("throws MealPlanError when planId is invalid", async () => {
      await expect(
        getMealPlanByIdService({
          planId: "invalid",
          subscriberId: 2,
        })
      ).rejects.toThrow(MealPlanError);

      expect(getMealPlanById).not.toHaveBeenCalled();
    });
  });

  describe("addPlanItemService", () => {
    test("adds a plan item when input is valid", async () => {
      const mealPlan = {
        planId: 1,
        subscriberId: 2,
        startDate: new Date("2026-05-01"),
        endDate: new Date("2026-05-07"),
      };

      const addedItem = {
        planItemId: 1,
        planId: 1,
        mealType: "lunch",
      };

      getMealPlanById.mockResolvedValue(mealPlan);
      addPlanItem.mockResolvedValue(addedItem);

      const result = await addPlanItemService({
        planId: "1",
        subscriberId: "2",
        item: {
          plannedDate: "2026-05-03",
          mealType: "lunch",
          recipeId: "4",
          servings: "2",
        },
      });

      expect(getMealPlanById).toHaveBeenCalledWith({
        planId: 1,
        subscriberId: 2,
      });
      expect(addPlanItem).toHaveBeenCalledWith({
        planId: "1",
        item: {
          plannedDate: expect.any(Date),
          mealType: "lunch",
          recipeId: 4,
          servings: 2,
        },
      });
      expect(result).toEqual(addedItem);
    });

    test("throws MealPlanError when meal plan does not exist", async () => {
      getMealPlanById.mockResolvedValue(null);

      await expect(
        addPlanItemService({
          planId: "1",
          subscriberId: "2",
          item: {
            plannedDate: "2026-05-03",
            mealType: "lunch",
            recipeId: "4",
            servings: "2",
          },
        })
      ).rejects.toThrow(MealPlanError);

      expect(addPlanItem).not.toHaveBeenCalled();
    });

    test("throws MealPlanError when item date is outside meal plan range", async () => {
      getMealPlanById.mockResolvedValue({
        planId: 1,
        subscriberId: 2,
        startDate: new Date("2026-05-01"),
        endDate: new Date("2026-05-07"),
      });

      await expect(
        addPlanItemService({
          planId: "1",
          subscriberId: "2",
          item: {
            plannedDate: "2026-05-10",
            mealType: "lunch",
            recipeId: "4",
            servings: "2",
          },
        })
      ).rejects.toThrow(MealPlanError);

      expect(addPlanItem).not.toHaveBeenCalled();
    });
  });

  describe("deleteMealPlanService", () => {
    test("deletes a meal plan when input is valid", async () => {
      const deletedPlan = {
        count: 1,
      };

      deleteMealPlan.mockResolvedValue(deletedPlan);

      const result = await deleteMealPlanService({
        planId: "1",
        subscriberId: "2",
      });

      expect(deleteMealPlan).toHaveBeenCalledWith({
        planId: 1,
        subscriberId: 2,
      });
      expect(result).toEqual(deletedPlan);
    });

    test("throws MealPlanError when subscriberId is invalid", async () => {
      await expect(
        deleteMealPlanService({
          planId: 1,
          subscriberId: null,
        })
      ).rejects.toThrow(MealPlanError);

      expect(deleteMealPlan).not.toHaveBeenCalled();
    });
  });

  describe("removePlanItemService", () => {
    test("removes a plan item when input is valid", async () => {
      const deleted = { count: 1 };
      removePlanItem.mockResolvedValue(deleted);

      const result = await removePlanItemService({
        planItemId: "10",
        planId: "1",
        subscriberId: "2",
      });

      expect(removePlanItem).toHaveBeenCalledWith({
        planItemId: 10,
        planId: 1,
        subscriberId: 2,
      });
      expect(result).toEqual(deleted);
    });

    test("throws MealPlanError when input is invalid", async () => {
      await expect(
        removePlanItemService({
          planItemId: "invalid",
          planId: "1",
          subscriberId: "2",
        })
      ).rejects.toThrow(MealPlanError);

      expect(removePlanItem).not.toHaveBeenCalled();
    });
  });
});
