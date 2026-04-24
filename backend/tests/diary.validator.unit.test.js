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
        items: [],
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
        mealType: "lunch",
        notes: "ok",
      };

      const result = validateListDisplay(input);

      expect(result).toEqual({
        subscriberId: 1,
        start: undefined,
        end: undefined,
        mealType: "lunch",
        notes: "ok",
      });
    });

    test("returns undefined start and end when not provided", () => {
      const result = validateListDisplay({
        subscriberId: 1,
        mealType: "dinner",
        notes: "nice",
      });

      expect(result).toEqual({
        subscriberId: 1,
        start: undefined,
        end: undefined,
        mealType: "dinner",
        notes: "nice",
      });
    });

    test("throws if subscriberId is missing", () => {
      expect(() =>
        validateListDisplay({
          mealType: "breakfast",
          notes: "yum",
        })
      ).toThrow(DiaryEntryError);
    });

    test("does not throw when consumedAt is provided", () => {
      expect(() =>
        validateListDisplay({
          subscriberId: 1,
          consumedAt: "bad-date",
          mealType: "breakfast",
          notes: "yum",
        })
      ).not.toThrow();
    });

    test("throws if mealType is invalid", () => {
      expect(() =>
        validateListDisplay({
          subscriberId: 1,
          mealType: "brunch",
          notes: "yum",
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if notes is not a string", () => {
      expect(() =>
        validateListDisplay({
          subscriberId: 1,
          mealType: "breakfast",
          notes: 123,
        })
      ).toThrow(DiaryEntryError);
    });
  });

  describe("validateEntryDetails", () => {
    test("returns normalized values when valid", () => {
      const result = validateEntryDetails({
        subscriberId: 1,
        diaryEntryId: 1,
      });

      expect(result).toEqual({
        subscriberId: 1,
        diaryEntryId: 1,
      });
    });

    test("throws if subscriberId is missing", () => {
      expect(() =>
        validateEntryDetails({
          diaryEntryId: 1,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if diaryEntryId is missing", () => {
      expect(() =>
        validateEntryDetails({
          subscriberId: 1,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if diaryEntryId is invalid", () => {
      expect(() =>
        validateEntryDetails({
          subscriberId: 1,
          diaryEntryId: -1,
        })
      ).toThrow(DiaryEntryError);
    });
  });

  describe("validateNewEntryDetails", () => {
    test("returns normalized values when valid", () => {
      const result = validateNewEntryDetails({
        userId: 1,
        diaryEntryId: 2,
        quantity: 30,
        portionId: 3,
      });

      expect(result).toEqual({
        userId: 1,
        diaryEntryId: 2,
        quantity: 30,
        portionId: 3,
      });
    });

    test("throws if userId is missing", () => {
      expect(() =>
        validateNewEntryDetails({
          diaryEntryId: 2,
          quantity: 30,
          portionId: 3,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if diaryEntryId is missing", () => {
      expect(() =>
        validateNewEntryDetails({
          userId: 1,
          quantity: 30,
          portionId: 3,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if quantity is invalid", () => {
      expect(() =>
        validateNewEntryDetails({
          userId: 1,
          diaryEntryId: 2,
          quantity: -1,
          portionId: 3,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if portionId is invalid", () => {
      expect(() =>
        validateNewEntryDetails({
          userId: 1,
          diaryEntryId: 2,
          quantity: 30,
          portionId: 0,
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
        userId: 1,
        portionId: undefined,
        quantity: undefined,
      });
    });

    test("returns normalized values when portionId is provided", () => {
      const result = validateUpdatedEntryItem({
        diaryEntryItemId: 1,
        userId: 1,
        portionId: 2,
      });

      expect(result).toEqual({
        diaryEntryItemId: 1,
        userId: 1,
        portionId: 2,
        quantity: undefined,
      });
    });

    test("returns normalized values when quantity is provided", () => {
      const result = validateUpdatedEntryItem({
        diaryEntryItemId: 1,
        userId: 1,
        quantity: 50,
      });

      expect(result).toEqual({
        diaryEntryItemId: 1,
        userId: 1,
        portionId: undefined,
        quantity: 50,
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

    test("throws if portionId is invalid", () => {
      expect(() =>
        validateUpdatedEntryItem({
          diaryEntryItemId: 1,
          userId: 1,
          portionId: -1,
        })
      ).toThrow(DiaryEntryError);
    });

    test("throws if quantity is invalid", () => {
      expect(() =>
        validateUpdatedEntryItem({
          diaryEntryItemId: 1,
          userId: 1,
          quantity: -10,
        })
      ).toThrow(DiaryEntryError);
    });
  });

  describe("validateDeletedDiaryEntry", () => {
    test("returns normalized values when valid", () => {
      const result = validateDeletedDiaryEntry({
        userId: 1,
        diaryEntryId: 2,
      });

      expect(result).toEqual({
        userId: 1,
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
    test("returns normalized values when valid", () => {
      const result = validateDeletedDiaryEntryItem({
        userId: 1,
        diaryEntryItemId: 2,
      });

      expect(result).toEqual({
        userId: 1,
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