import {
  DiaryEntryError,
  validateCreateDiaryEntryInput,
  validateSummaryInput,
  validateListDisplay,
  validateEntryDetails,
  validateNewEntryDetails,
  validateUpdatedEntryItem,
} from "../src/modules/diary/diary.validator.js";

describe("Diary validator unit tests", () => {
  describe("validateCreateDiaryEntryInput", () => {
    test("returns normalized valid input", () => {
      const result = validateCreateDiaryEntryInput({
        subscriberId: 1,
        consumedAt: "2026-04-19T12:00:00.000Z",
        mealType: "breakfast",
        notes: "test",
      });

      expect(result.subscriberId).toBe(1);
      expect(result.mealType).toBe("breakfast");
      expect(result.notes).toBe("test");
      expect(result.consumedAt).toBeInstanceOf(Date);
    });

    test("throws when subscriberId is invalid", () => {
      expect(() =>
        validateCreateDiaryEntryInput({
          subscriberId: 0,
          consumedAt: "2026-04-19T12:00:00.000Z",
          mealType: "breakfast",
        })
      ).toThrow(new DiaryEntryError("Subscriber ID is required"));
    });

    test("throws when consumedAt is missing", () => {
      expect(() =>
        validateCreateDiaryEntryInput({
          subscriberId: 1,
          mealType: "breakfast",
        })
      ).toThrow("Consumed at date is required");
    });

    test("throws when mealType is invalid", () => {
      expect(() =>
        validateCreateDiaryEntryInput({
          subscriberId: 1,
          consumedAt: "2026-04-19T12:00:00.000Z",
          mealType: "brunch",
        })
      ).toThrow(
        "Meal type is required and must be one of: breakfast, lunch, dinner, snack"
      );
    });
  });

  describe("validateSummaryInput", () => {
    test("returns normalized valid input", () => {
      const result = validateSummaryInput({
        subscriberId: 1,
        period: "daily",
        endDate: "2026-04-19",
      });

      expect(result.subscriberId).toBe(1);
      expect(result.period).toBe("daily");
      expect(result.endDate).toBeInstanceOf(Date);
    });

    test("throws when period is invalid", () => {
      expect(() =>
        validateSummaryInput({
          subscriberId: 1,
          period: "yearly",
          endDate: "2026-04-19",
        })
      ).toThrow(
        "Period is required and must be one of: daily, weekly, monthly"
      );
    });

    test("throws when endDate is invalid", () => {
      expect(() =>
        validateSummaryInput({
          subscriberId: 1,
          period: "daily",
          endDate: "not-a-date",
        })
      ).toThrow("endDate is required and must be a valid date");
    });
  });

  describe("validateListDisplay", () => {
    test("returns valid filters", () => {
      const result = validateListDisplay({
        subscriberId: 1,
        consumedAt: "2026-04-19",
        mealType: "lunch",
        notes: "hello",
      });

      expect(result.subscriberId).toBe(1);
      expect(result.consumedAt).toBeInstanceOf(Date);
      expect(result.mealType).toBe("lunch");
      expect(result.notes).toBe("hello");
    });

    test("throws when consumedAt is invalid", () => {
      expect(() =>
        validateListDisplay({
          subscriberId: 1,
          consumedAt: "bad-date",
        })
      ).toThrow("Consumed at date must be a valid date");
    });

    test("throws when mealType is invalid", () => {
      expect(() =>
        validateListDisplay({
          subscriberId: 1,
          mealType: "brunch",
        })
      ).toThrow("Meal type must be one of: breakfast, lunch, dinner, snack");
    });
  });

  describe("validateEntryDetails", () => {
    test("returns valid diaryEntryId", () => {
      expect(validateEntryDetails({ diaryEntryId: 2 })).toEqual({
        diaryEntryId: 2,
      });
    });

    test("throws when diaryEntryId is invalid", () => {
      expect(() =>
        validateEntryDetails({ diaryEntryId: "2" })
      ).toThrow("Diary Entry ID is required");
    });
  });

  describe("validateNewEntryDetails", () => {
    test("returns valid new entry item payload", () => {
      expect(
        validateNewEntryDetails({
          userId: 1,
          diaryEntryId: 2,
          quantityG: 100,
          foodItemId: 3,
        })
      ).toEqual({
        diaryEntryId: 2,
        quantityG: 100,
        foodItemId: 3,
      });
    });

    test("throws when quantityG is invalid", () => {
      expect(() =>
        validateNewEntryDetails({
          userId: 1,
          diaryEntryId: 2,
          quantityG: 0,
          foodItemId: 3,
        })
      ).toThrow("Quantity in grams is required and must be a positive number");
    });
  });

  describe("validateUpdatedEntryItem", () => {
    test("returns valid updated entry item payload", () => {
      expect(
        validateUpdatedEntryItem({
          diaryEntryItemId: 1,
          userId: 2,
          foodItemId: 3,
          quantityG: 120,
        })
      ).toEqual({
        diaryEntryItemId: 1,
        foodItemId: 3,
        quantityG: 120,
      });
    });

    test("throws when diaryEntryItemId is invalid", () => {
      expect(() =>
        validateUpdatedEntryItem({
          diaryEntryItemId: 0,
          userId: 2,
          foodItemId: 3,
          quantityG: 120,
        })
      ).toThrow("Diary Entry ID is required");
    });

    test("throws when quantityG is invalid", () => {
      expect(() =>
        validateUpdatedEntryItem({
          diaryEntryItemId: 1,
          userId: 2,
          quantityG: -1,
        })
      ).toThrow("Quantity in grams is required and must be a positive number");
    });
  });
});