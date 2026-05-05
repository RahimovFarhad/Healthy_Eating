// tests/meal-plans/meal-plans.validator.unit.test.js
import { expect } from "@jest/globals";
import {
  MealPlanError,
  getMealErrorStatusCode,
  validateCreateMealPlanInput,
  validateListMealPlansInput,
  validateGetMealPlanByIdInput,
  validatePlanItem,
} from "../../src/modules/meal-plans/meal-plans.validator.js";

describe("Meal Plans Validator", () => {
  describe("getMealErrorStatusCode", () => {
    test("returns 400 for MealPlanError", () => {
      const error = new MealPlanError("Invalid plan type");

      const result = getMealErrorStatusCode(error);

      expect(result).toBe(400);
    });

    test("returns 404 for MealPlanError with not found message", () => {
      const error = new MealPlanError("Meal plan not found");

      const result = getMealErrorStatusCode(error);

      expect(result).toBe(404);
    });

    test("returns 500 for non-MealPlanError", () => {
      const error = new Error("Unexpected error");

      const result = getMealErrorStatusCode(error);

      expect(result).toBe(500);
    });
  });

  describe("validateCreateMealPlanInput", () => {
    test("returns normalised values when input is valid", () => {
      const input = {
        subscriberId: 1,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: "manual",
        items: [
          {
            plannedDate: "2026-05-02",
            mealType: "breakfast",
            recipeId: 1,
            servings: 2,
          },
        ],
      };

      const result = validateCreateMealPlanInput(input);

      expect(result.subscriberId).toBe(1);
      expect(result.planType).toBe("manual");
      expect(result.items).toHaveLength(1);
      expect(result.items[0].mealType).toBe("breakfast");
      expect(result.items[0].recipeId).toBe(1);
      expect(result.items[0].servings).toBe(2);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });

    test("returns empty items array when items is not provided", () => {
      const input = {
        subscriberId: 1,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: "manual",
      };

      const result = validateCreateMealPlanInput(input);

      expect(result.items).toEqual([]);
    });

    test("trims planType when it has extra spaces", () => {
      const input = {
        subscriberId: 1,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: " manual ",
        items: [],
      };

      const result = validateCreateMealPlanInput(input);

      expect(result.planType).toBe("manual");
    });

    test("throws MealPlanError when subscriberId is missing", () => {
      const input = {
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: "manual",
        items: [],
      };

      expect(() => validateCreateMealPlanInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when subscriberId is zero", () => {
      const input = {
        subscriberId: 0,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: "manual",
        items: [],
      };

      expect(() => validateCreateMealPlanInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when startDate is invalid", () => {
      const input = {
        subscriberId: 1,
        startDate: "not-a-date",
        endDate: "2026-05-07",
        planType: "manual",
        items: [],
      };

      expect(() => validateCreateMealPlanInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when endDate is invalid", () => {
      const input = {
        subscriberId: 1,
        startDate: "2026-05-01",
        endDate: "not-a-date",
        planType: "manual",
        items: [],
      };

      expect(() => validateCreateMealPlanInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when endDate is before startDate", () => {
      const input = {
        subscriberId: 1,
        startDate: "2026-05-07",
        endDate: "2026-05-01",
        planType: "manual",
        items: [],
      };

      expect(() => validateCreateMealPlanInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when planType is missing", () => {
      const input = {
        subscriberId: 1,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        items: [],
      };

      expect(() => validateCreateMealPlanInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when planType is invalid", () => {
      const input = {
        subscriberId: 1,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: "invalid",
        items: [],
      };

      expect(() => validateCreateMealPlanInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when items is not an array", () => {
      const input = {
        subscriberId: 1,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: "manual",
        items: "not-array",
      };

      expect(() => validateCreateMealPlanInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when plannedDate is outside meal plan date range", () => {
      const input = {
        subscriberId: 1,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
        planType: "manual",
        items: [
          {
            plannedDate: "2026-05-10",
            mealType: "breakfast",
            recipeId: 1,
            servings: 2,
          },
        ],
      };

      expect(() => validateCreateMealPlanInput(input)).toThrow(MealPlanError);
    });
  });

  describe("validateListMealPlansInput", () => {
    test("returns normalised values when input is valid", () => {
      const input = {
        subscriberId: 1,
        startDate: "2026-05-01",
        endDate: "2026-05-07",
      };

      const result = validateListMealPlansInput(input);

      expect(result.subscriberId).toBe(1);
      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });

    test("allows startDate and endDate to be omitted", () => {
      const input = {
        subscriberId: 1,
      };

      const result = validateListMealPlansInput(input);

      expect(result).toEqual({
        subscriberId: 1,
        startDate: null,
        endDate: null,
      });
    });

    test("throws MealPlanError when subscriberId is missing", () => {
      expect(() => validateListMealPlansInput({})).toThrow(MealPlanError);
    });

    test("throws MealPlanError when startDate is invalid", () => {
      const input = {
        subscriberId: 1,
        startDate: "invalid-date",
      };

      expect(() => validateListMealPlansInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when endDate is invalid", () => {
      const input = {
        subscriberId: 1,
        endDate: "invalid-date",
      };

      expect(() => validateListMealPlansInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when endDate is before startDate", () => {
      const input = {
        subscriberId: 1,
        startDate: "2026-05-07",
        endDate: "2026-05-01",
      };

      expect(() => validateListMealPlansInput(input)).toThrow(MealPlanError);
    });
  });

  describe("validateGetMealPlanByIdInput", () => {
    test("returns normalised values when input is valid", () => {
      const input = {
        planId: 2,
        subscriberId: 1,
      };

      const result = validateGetMealPlanByIdInput(input);

      expect(result).toEqual({
        planId: 2,
        subscriberId: 1,
      });
    });

    test("returns normalised values when ids are numeric strings", () => {
      const input = {
        planId: "2",
        subscriberId: "1",
      };

      const result = validateGetMealPlanByIdInput(input);

      expect(result).toEqual({
        planId: 2,
        subscriberId: 1,
      });
    });

    test("throws MealPlanError when planId is missing", () => {
      const input = {
        subscriberId: 1,
      };

      expect(() => validateGetMealPlanByIdInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when planId is zero", () => {
      const input = {
        planId: 0,
        subscriberId: 1,
      };

      expect(() => validateGetMealPlanByIdInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when subscriberId is missing", () => {
      const input = {
        planId: 1,
      };

      expect(() => validateGetMealPlanByIdInput(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when subscriberId is negative", () => {
      const input = {
        planId: 1,
        subscriberId: -1,
      };

      expect(() => validateGetMealPlanByIdInput(input)).toThrow(MealPlanError);
    });
  });

  describe("validatePlanItem", () => {
    test("returns normalised values when item is valid", () => {
      const input = {
        plannedDate: "2026-05-02",
        mealType: "lunch",
        recipeId: 3,
        servings: 2,
      };

      const result = validatePlanItem(input);

      expect(result.plannedDate).toBeInstanceOf(Date);
      expect(result.mealType).toBe("lunch");
      expect(result.recipeId).toBe(3);
      expect(result.servings).toBe(2);
    });

    test("returns null servings when servings is not provided", () => {
      const input = {
        plannedDate: "2026-05-02",
        mealType: "lunch",
        recipeId: 3,
      };

      const result = validatePlanItem(input);

      expect(result.servings).toBeNull();
    });

    test("trims mealType when it has extra spaces", () => {
      const input = {
        plannedDate: "2026-05-02",
        mealType: " lunch ",
        recipeId: 3,
        servings: 2,
      };

      const result = validatePlanItem(input);

      expect(result.mealType).toBe("lunch");
    });

    test("throws MealPlanError when plannedDate is invalid", () => {
      const input = {
        plannedDate: "invalid-date",
        mealType: "lunch",
        recipeId: 3,
        servings: 2,
      };

      expect(() => validatePlanItem(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when mealType is missing", () => {
      const input = {
        plannedDate: "2026-05-02",
        recipeId: 3,
        servings: 2,
      };

      expect(() => validatePlanItem(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when mealType is invalid", () => {
      const input = {
        plannedDate: "2026-05-02",
        mealType: "invalid",
        recipeId: 3,
        servings: 2,
      };

      expect(() => validatePlanItem(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when recipeId is missing", () => {
      const input = {
        plannedDate: "2026-05-02",
        mealType: "lunch",
        servings: 2,
      };

      expect(() => validatePlanItem(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when recipeId is zero", () => {
      const input = {
        plannedDate: "2026-05-02",
        mealType: "lunch",
        recipeId: 0,
        servings: 2,
      };

      expect(() => validatePlanItem(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when servings is zero", () => {
      const input = {
        plannedDate: "2026-05-02",
        mealType: "lunch",
        recipeId: 3,
        servings: 0,
      };

      expect(() => validatePlanItem(input)).toThrow(MealPlanError);
    });

    test("throws MealPlanError when servings is negative", () => {
      const input = {
        plannedDate: "2026-05-02",
        mealType: "lunch",
        recipeId: 3,
        servings: -1,
      };

      expect(() => validatePlanItem(input)).toThrow(MealPlanError);
    });
  });
});