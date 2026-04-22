// tests/diary.validator.unit.test.js
import { expect } from "@jest/globals";
import {
  DiaryEntryError,
  validateCreateDiaryEntryInput,
  validateSummaryInput,
  validateListDisplay,
  validateEntryDetails,
  validateNewEntryDetails,
  validateUpdatedEntryItem,
  validateDeletedDiaryEntry,
  validateDeletedDiaryEntryItem,
} from "../src/modules/diary/diary.validator.js";

describe("Diary Validator", () => {
  describe("validateCreateDiaryEntryInput", () => {
    test("returns normalized values when input is valid", () => {
      const input = {
        subscriberId: 1,
        consumedAt: "2026-04-18",
        mealType: "breakfast",
        notes: "yum",
      };

      const result = validateCreateDiaryEntryInput(input);

      expect(result).toEqual({
        subscriberId: 1,
        consumedAt: new Date("2026-04-18"),
        mealType: "breakfast",
        notes: "yum",
      });
    });

    test("throws if subscriberId is missing", () => {
      expect(() =>
        validateCreateDiaryEntryInput({
          consumedAt: "2026-04-18",
          mealType: "breakfast",
          notes: "yum",
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if consumedAt is invalid", () => {
      expect(() =>
        validateCreateDiaryEntryInput({
          subscriberId: 1,
          consumedAt: "not-a-date",
          mealType: "breakfast",
          notes: "yum",
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if mealType is invalid", () => {
      expect(() =>
        validateCreateDiaryEntryInput({
          subscriberId: 1,
          consumedAt: "2026-04-18",
          mealType: "brunch",
          notes: "yum",
        })
      ).toThrow(DiaryEntryError);
    });
  });

  describe("validateSummaryInput", () => {
    test("returns normalized values when input is valid", () => {
      const input = {
        subscriberId: 1,
        period: "daily",
        endDate: "2026-04-18",
      };

      const result = validateSummaryInput(input);

      expect(result).toEqual({
        subscriberId: 1,
        period: "daily",
        endDate: new Date("2026-04-18"),
      });
    });

    test("throws if subscriberId is missing", () => {
      expect(() =>
        validateSummaryInput({
          period: "daily",
          endDate: "2026-04-18",
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if period is invalid", () => {
      expect(() =>
        validateSummaryInput({
          subscriberId: 1,
          period: "yearly",
          endDate: "2026-04-18",
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if endDate is invalid", () => {
      expect(() =>
        validateSummaryInput({
          subscriberId: 1,
          period: "daily",
          endDate: "bad-date",
        })
      ).toThrow(DiaryEntryError);
    });
  });

  describe("validateListDisplay", () => {
    test("returns normalized values when input is valid", () => {
      const input = {
        subscriberId: 1,
        consumedAt: "2026-04-18",
        mealType: "lunch",
        notes: "ok",
      };

      const result = validateListDisplay(input);

      expect(result).toEqual({
        subscriberId: 1,
        consumedAt: new Date("2026-04-18"),
        mealType: "lunch",
        notes: "ok",
      });
    });

    test("returns undefined consumedAt when not provided", () => {
      const result = validateListDisplay({
        subscriberId: 1,
        mealType: "dinner",
        notes: "nice",
      });

      expect(result).toEqual({
        subscriberId: 1,
        consumedAt: undefined,
        mealType: "dinner",
        notes: "nice",
      });
    });

    test("throws if subscriberId is missing", () => {
      expect(() =>
        validateListDisplay({
          consumedAt: "2026-04-18",
          mealType: "breakfast",
          notes: "yum",
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if consumedAt is invalid", () => {
      expect(() =>
        validateListDisplay({
          subscriberId: 1,
          consumedAt: "bad-date",
          mealType: "breakfast",
          notes: "yum",
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if mealType is invalid", () => {
      expect(() =>
        validateListDisplay({
          subscriberId: 1,
          consumedAt: "2026-04-18",
          mealType: "brunch",
          notes: "yum",
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if notes is not a string", () => {
      expect(() =>
        validateListDisplay({
          subscriberId: 1,
          consumedAt: "2026-04-18",
          mealType: "breakfast",
          notes: 123,
        })
      ).toThrow(DiaryEntryError);
    });
  });

  describe("validateEntryDetails", () => {
    test("returns diaryEntryId when valid", () => {
      expect(validateEntryDetails({ diaryEntryId: 1 })).toEqual({
        diaryEntryId: 1,
      });
    });

    test("throws if diaryEntryId is missing", () => {
      expect(() => validateEntryDetails({})).toThrow(DiaryEntryError);
    });

    test("throws if diaryEntryId is invalid", () => {
      expect(() => validateEntryDetails({ diaryEntryId: -1 })).toThrow(
        DiaryEntryError
      );
    });
  });

  describe("validateNewEntryDetails", () => {
    test("returns normalized values when valid", () => {
      const result = validateNewEntryDetails({
        userId: 1,
        diaryEntryId: 2,
        quantityG: 30,
        foodItemId: 3,
      });

      expect(result).toEqual({
        diaryEntryId: 2,
        quantityG: 30,
        foodItemId: 3,
      });
    });

    test("throws if userId is missing", () => {
      expect(() =>
        validateNewEntryDetails({
          diaryEntryId: 2,
          quantityG: 30,
          foodItemId: 3,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if diaryEntryId is missing", () => {
      expect(() =>
        validateNewEntryDetails({
          userId: 1,
          quantityG: 30,
          foodItemId: 3,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if quantityG is invalid", () => {
      expect(() =>
        validateNewEntryDetails({
          userId: 1,
          diaryEntryId: 2,
          quantityG: -1,
          foodItemId: 3,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if foodItemId is invalid", () => {
      expect(() =>
        validateNewEntryDetails({
          userId: 1,
          diaryEntryId: 2,
          quantityG: 30,
          foodItemId: 0,
        })
      ).toThrow(DiaryEntryError);
    });
  });

  describe("validateUpdatedEntryItem", () => {
    test("returns normalized values when only required fields are valid", () => {
      const result = validateUpdatedEntryItem({
        diaryEntryItemId: 1,
        userId: 1,
      });

      expect(result).toEqual({
        diaryEntryItemId: 1,
        foodItemId: undefined,
        quantityG: undefined,
      });
    });

    test("returns normalized values when foodItemId is provided", () => {
      const result = validateUpdatedEntryItem({
        diaryEntryItemId: 1,
        userId: 1,
        foodItemId: 2,
      });

      expect(result).toEqual({
        diaryEntryItemId: 1,
        foodItemId: 2,
        quantityG: undefined,
      });
    });

    test("returns normalized values when quantityG is provided", () => {
      const result = validateUpdatedEntryItem({
        diaryEntryItemId: 1,
        userId: 1,
        quantityG: 50,
      });

      expect(result).toEqual({
        diaryEntryItemId: 1,
        foodItemId: undefined,
        quantityG: 50,
      });
    });

    test("throws if diaryEntryItemId is missing", () => {
      expect(() =>
        validateUpdatedEntryItem({
          userId: 1,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if userId is missing", () => {
      expect(() =>
        validateUpdatedEntryItem({
          diaryEntryItemId: 1,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if foodItemId is invalid", () => {
      expect(() =>
        validateUpdatedEntryItem({
          diaryEntryItemId: 1,
          userId: 1,
          foodItemId: -1,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if quantityG is invalid", () => {
      expect(() =>
        validateUpdatedEntryItem({
          diaryEntryItemId: 1,
          userId: 1,
          quantityG: -10,
        })
      ).toThrow(DiaryEntryError);
    });
  });

  describe("validateDeletedDiaryEntry", () => {
    test("returns diaryEntryId when valid", () => {
      const result = validateDeletedDiaryEntry({
        userId: 1,
        diaryEntryId: 2,
      });

      expect(result).toEqual({
        diaryEntryId: 2,
      });
    });

    test("throws if userId is missing", () => {
      expect(() =>
        validateDeletedDiaryEntry({
          diaryEntryId: 2,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if diaryEntryId is missing", () => {
      expect(() =>
        validateDeletedDiaryEntry({
          userId: 1,
        })
      ).toThrow(DiaryEntryError);
    });
  });

  describe("validateDeletedDiaryEntryItem", () => {
    test("returns diaryEntryItemId when valid", () => {
      const result = validateDeletedDiaryEntryItem({
        userId: 1,
        diaryEntryItemId: 2,
      });

      expect(result).toEqual({
        diaryEntryItemId: 2,
      });
    });

    test("throws if userId is missing", () => {
      expect(() =>
        validateDeletedDiaryEntryItem({
          diaryEntryItemId: 2,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if diaryEntryItemId is missing", () => {
      expect(() =>
        validateDeletedDiaryEntryItem({
          userId: 1,
        })
      ).toThrow(DiaryEntryError);
    });
  });
});