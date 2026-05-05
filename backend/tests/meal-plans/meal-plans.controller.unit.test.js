import { jest, expect } from "@jest/globals";
import { MealPlanError } from "../../src/modules/meal-plans/meal-plans.validator.js";

const createMealPlanService = jest.fn();
const listMealPlansService = jest.fn();
const getMealPlanByIdService = jest.fn();
const addPlanItemService = jest.fn();
const deleteMealPlanService = jest.fn();

jest.unstable_mockModule("../../src/modules/meal-plans/meal-plans.service.js", () => ({
  createMealPlanService,
  listMealPlansService,
  getMealPlanByIdService,
  addPlanItemService,
  deleteMealPlanService,
}));

const {
  createMealPlan,
  listMealPlans,
  getMealPlanById,
  addPlanItem,
  deleteMealPlan,
} = await import("../../src/modules/meal-plans/meal-plans.controller.js");

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Meal Plans Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createMealPlan", () => {
    test("returns 201 and meal plan when service succeeds", async () => {
      const mealPlan = {
        planId: 1,
        subscriberId: 2,
        planType: "manual",
      };

      createMealPlanService.mockResolvedValue(mealPlan);

      const req = {
        user: {
          userId: 2,
        },
        body: {
          startDate: "2026-05-01",
          endDate: "2026-05-07",
          planType: "manual",
          items: [],
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await createMealPlan(req, res, next);

      expect(createMealPlanService).toHaveBeenCalledWith({
        subscriberId: 2,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: "manual",
        items: [],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mealPlan);
      expect(next).not.toHaveBeenCalled();
    });

    test("uses manual as default planType when planType is missing", async () => {
      const mealPlan = {
        planId: 1,
        planType: "manual",
      };

      createMealPlanService.mockResolvedValue(mealPlan);

      const req = {
        user: {
          userId: 2,
        },
        body: {
          startDate: "2026-05-01",
          endDate: "2026-05-07",
          items: [],
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await createMealPlan(req, res, next);

      expect(createMealPlanService).toHaveBeenCalledWith({
        subscriberId: 2,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: "manual",
        items: [],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mealPlan);
    });

    test("uses null subscriberId when user is missing", async () => {
      const mealPlan = {
        planId: 1,
      };

      createMealPlanService.mockResolvedValue(mealPlan);

      const req = {
        body: {
          startDate: "2026-05-01",
          endDate: "2026-05-07",
          planType: "manual",
          items: [],
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await createMealPlan(req, res, next);

      expect(createMealPlanService).toHaveBeenCalledWith({
        subscriberId: null,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: "manual",
        items: [],
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("returns 400 when service throws MealPlanError", async () => {
      createMealPlanService.mockRejectedValue(
        new MealPlanError("Subscriber ID must be a positive integer")
      );

      const req = {
        body: {
          startDate: "2026-05-01",
          endDate: "2026-05-07",
          planType: "manual",
          items: [],
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await createMealPlan(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Subscriber ID must be a positive integer",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unexpected error", async () => {
      const error = new Error("Unexpected error");
      createMealPlanService.mockRejectedValue(error);

      const req = {
        user: {
          userId: 2,
        },
        body: {
          startDate: "2026-05-01",
          endDate: "2026-05-07",
          planType: "manual",
          items: [],
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await createMealPlan(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("listMealPlans", () => {
    test("returns 200 and meal plans when service succeeds", async () => {
      const mealPlans = [
        {
          planId: 1,
          subscriberId: 2,
        },
      ];

      listMealPlansService.mockResolvedValue(mealPlans);

      const req = {
        user: {
          userId: 2,
        },
        query: {
          startDate: "2026-05-01",
          endDate: "2026-05-07",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await listMealPlans(req, res, next);

      expect(listMealPlansService).toHaveBeenCalledWith({
        subscriberId: 2,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mealPlans);
      expect(next).not.toHaveBeenCalled();
    });

    test("uses null subscriberId when user is missing", async () => {
      listMealPlansService.mockResolvedValue([]);

      const req = {
        query: {},
      };
      const res = mockResponse();
      const next = jest.fn();

      await listMealPlans(req, res, next);

      expect(listMealPlansService).toHaveBeenCalledWith({
        subscriberId: null,
        startDate: undefined,
        endDate: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("returns 400 when service throws MealPlanError", async () => {
      listMealPlansService.mockRejectedValue(
        new MealPlanError("Subscriber ID must be a positive integer")
      );

      const req = {
        query: {},
      };
      const res = mockResponse();
      const next = jest.fn();

      await listMealPlans(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Subscriber ID must be a positive integer",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unexpected error", async () => {
      const error = new Error("Database error");
      listMealPlansService.mockRejectedValue(error);

      const req = {
        user: {
          userId: 2,
        },
        query: {},
      };
      const res = mockResponse();
      const next = jest.fn();

      await listMealPlans(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getMealPlanById", () => {
    test("returns 200 and meal plan when service succeeds", async () => {
      const mealPlan = {
        planId: 1,
        subscriberId: 2,
      };

      getMealPlanByIdService.mockResolvedValue(mealPlan);

      const req = {
        user: {
          userId: 2,
        },
        params: {
          planId: "1",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await getMealPlanById(req, res, next);

      expect(getMealPlanByIdService).toHaveBeenCalledWith({
        planId: "1",
        subscriberId: 2,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mealPlan);
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 404 when meal plan is not found", async () => {
      getMealPlanByIdService.mockResolvedValue(null);

      const req = {
        user: {
          userId: 2,
        },
        params: {
          planId: "999",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await getMealPlanById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Meal plan not found",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when service throws MealPlanError", async () => {
      getMealPlanByIdService.mockRejectedValue(
        new MealPlanError("Plan ID must be a positive integer")
      );

      const req = {
        user: {
          userId: 2,
        },
        params: {
          planId: "invalid",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await getMealPlanById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Plan ID must be a positive integer",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unexpected error", async () => {
      const error = new Error("Unexpected error");
      getMealPlanByIdService.mockRejectedValue(error);

      const req = {
        user: {
          userId: 2,
        },
        params: {
          planId: "1",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await getMealPlanById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("addPlanItem", () => {
    test("returns 201 and added item when service succeeds", async () => {
      const addedItem = {
        planItemId: 1,
        planId: 1,
        mealType: "lunch",
      };

      addPlanItemService.mockResolvedValue(addedItem);

      const req = {
        user: {
          userId: 2,
        },
        params: {
          planId: "1",
        },
        body: {
          plannedDate: "2026-05-03",
          mealType: "lunch",
          recipeId: 4,
          servings: 2,
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await addPlanItem(req, res, next);

      expect(addPlanItemService).toHaveBeenCalledWith({
        planId: "1",
        subscriberId: 2,
        item: {
          plannedDate: "2026-05-03",
          mealType: "lunch",
          recipeId: 4,
          servings: 2,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(addedItem);
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when service throws MealPlanError", async () => {
      addPlanItemService.mockRejectedValue(
        new MealPlanError("Meal type is required")
      );

      const req = {
        user: {
          userId: 2,
        },
        params: {
          planId: "1",
        },
        body: {},
      };
      const res = mockResponse();
      const next = jest.fn();

      await addPlanItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Meal type is required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unexpected error", async () => {
      const error = new Error("Unexpected error");
      addPlanItemService.mockRejectedValue(error);

      const req = {
        user: {
          userId: 2,
        },
        params: {
          planId: "1",
        },
        body: {
          plannedDate: "2026-05-03",
          mealType: "lunch",
          recipeId: 4,
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await addPlanItem(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteMealPlan", () => {
    test("returns 200 and deleted plan when service succeeds", async () => {
      const deletedPlan = {
        count: 1,
      };

      deleteMealPlanService.mockResolvedValue(deletedPlan);

      const req = {
        user: {
          userId: 2,
        },
        params: {
          planId: "1",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await deleteMealPlan(req, res, next);

      expect(deleteMealPlanService).toHaveBeenCalledWith({
        planId: "1",
        subscriberId: 2,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(deletedPlan);
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 404 when no meal plan is deleted", async () => {
      deleteMealPlanService.mockResolvedValue({
        count: 0,
      });

      const req = {
        user: {
          userId: 2,
        },
        params: {
          planId: "999",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await deleteMealPlan(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Meal plan not found or you don't have permission to delete it",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when service throws MealPlanError", async () => {
      deleteMealPlanService.mockRejectedValue(
        new MealPlanError("Plan ID must be a positive integer")
      );

      const req = {
        user: {
          userId: 2,
        },
        params: {
          planId: "invalid",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await deleteMealPlan(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Plan ID must be a positive integer",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unexpected error", async () => {
      const error = new Error("Unexpected error");
      deleteMealPlanService.mockRejectedValue(error);

      const req = {
        user: {
          userId: 2,
        },
        params: {
          planId: "1",
        },
      };
      const res = mockResponse();
      const next = jest.fn();

      await deleteMealPlan(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});