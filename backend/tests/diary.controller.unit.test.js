import { jest } from "@jest/globals";

const mockUpdateDiaryEntryItem = jest.fn();
const mockDeleteExistingDiaryEntry = jest.fn();

class MockDiaryEntryError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiaryEntryError";
  }
}

jest.unstable_mockModule("../src/modules/diary/diary.service.js", () => ({
  createDiaryEntry: jest.fn(),
  getNutritionSummary: jest.fn(),
  listDiaryEntries: jest.fn(),
  getDiaryEntryById: jest.fn(),
  createDiaryEntryItem: jest.fn(),
  updateDiaryEntryItem: mockUpdateDiaryEntryItem,
  deleteExistingDiaryEntry: mockDeleteExistingDiaryEntry,
  deleteExistingDiaryEntryItem: jest.fn(),
}));

jest.unstable_mockModule("../src/modules/diary/diary.validator.js", () => ({
  DiaryEntryError: MockDiaryEntryError,
  validateCreateDiaryEntryInput: jest.fn(),
  validateSummaryInput: jest.fn(),
  validateListDisplay: jest.fn(),
  validateEntryDetails: jest.fn(),
  validateNewEntryDetails: jest.fn(),
  validateUpdatedEntryItem: jest.fn(),
  validateDeletedDiaryEntry: jest.fn(),
  validateDeletedDiaryEntryItem: jest.fn(),
}));

const {
  updateDiaryEntryItem,
  deleteEntry,
} = await import("../src/modules/diary/diary.controller.js");

function createMockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("Diary controller unit tests", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
    res = createMockRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("updateDiaryEntryItem", () => {
    test("returns 200 with updatedEntry when service succeeds", async () => {
      const updatedEntry = { id: 10, quantityG: 200 };

      mockUpdateDiaryEntryItem.mockResolvedValue(updatedEntry);

      req = {
        user: { userId: 1 },
        params: { itemId: "10" },
        body: { foodItemId: 2, quantityG: 200 },
      };

      await updateDiaryEntryItem(req, res, next);

      expect(mockUpdateDiaryEntryItem).toHaveBeenCalledWith({
        userId: 1,
        diaryEntryItemId: "10",
        foodItemId: 2,
        quantityG: 200,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ updatedEntry });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when service throws DiaryEntryError", async () => {
      mockUpdateDiaryEntryItem.mockRejectedValue(
        new MockDiaryEntryError("Diary Entry ID is required")
      );

      req = {
        user: { userId: 1 },
        params: { itemId: "abc" },
        body: {},
      };

      await updateDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Diary Entry ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unknown error", async () => {
      const error = new Error("DB crashed");
      mockUpdateDiaryEntryItem.mockRejectedValue(error);

      req = {
        user: { userId: 1 },
        params: { itemId: "10" },
        body: { quantityG: 100 },
      };

      await updateDiaryEntryItem(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteEntry", () => {
    test("returns 200 with deleteEntry when service succeeds", async () => {
      const deleted = { diaryEntryId: 5 };

      mockDeleteExistingDiaryEntry.mockResolvedValue(deleted);

      req = {
        user: { userId: 1 },
        params: { id: "5" },
      };

      await deleteEntry(req, res, next);

      expect(mockDeleteExistingDiaryEntry).toHaveBeenCalledWith({
        userId: 1,
        diaryEntryId: "5",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ deleteEntry: deleted });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when service throws DiaryEntryError", async () => {
      mockDeleteExistingDiaryEntry.mockRejectedValue(
        new MockDiaryEntryError("Diary Entry ID is required")
      );

      req = {
        user: { userId: 1 },
        params: { id: "abc" },
      };

      await deleteEntry(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Diary Entry ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("calls next when service throws unknown error", async () => {
      const error = new Error("Unexpected failure");
      mockDeleteExistingDiaryEntry.mockRejectedValue(error);

      req = {
        user: { userId: 1 },
        params: { id: "5" },
      };

      await deleteEntry(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});