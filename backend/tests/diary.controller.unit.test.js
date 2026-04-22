// tests/diary.controller.unit.test.js
import { expect, jest } from "@jest/globals";
import { DiaryEntryError } from "../src/modules/diary/diary.validator.js";

const TEST_ID = 1;
const TEST_USERID = 2;
const TEST_ENTRYID = 3;
const TEST_ENTRYITEMID = 4;

// diary.service mock functions
const mockCreateDiaryEntry = jest.fn();
const mockGetNutritionSummary = jest.fn();
const mockListDiaryEntries = jest.fn();
const mockGetDiaryEntryById = jest.fn();
const mockCreateDiaryEntryItem = jest.fn();
const mockUpdateDiaryEntryItem = jest.fn();
const mockDeleteExistingDiaryEntry = jest.fn();
const mockDeleteExistingDiaryEntryItem = jest.fn();

jest.unstable_mockModule("../src/modules/diary/diary.service.js", () => ({
  createDiaryEntry: mockCreateDiaryEntry,
  getNutritionSummary: mockGetNutritionSummary,
  listDiaryEntries: mockListDiaryEntries,
  getDiaryEntryById: mockGetDiaryEntryById,
  createDiaryEntryItem: mockCreateDiaryEntryItem,
  updateDiaryEntryItem: mockUpdateDiaryEntryItem,
  deleteExistingDiaryEntry: mockDeleteExistingDiaryEntry,
  deleteExistingDiaryEntryItem: mockDeleteExistingDiaryEntryItem,
}));

const {
  createEntry,
  getSummary,
  listDiaryEntries,
  getDiaryEntryById,
  createDiaryEntryItem,
  updateDiaryEntryItem,
  deleteEntry,
  deleteEntryItem,
} = await import("../src/modules/diary/diary.controller.js");

function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Diary Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createEntry", () => {
    test("returns 201 and creates a new diary entry when successful", async () => {
      const req = {
        user: { userId: TEST_USERID },
        body: {
          consumedAt: "2026-04-18",
          mealType: "breakfast",
          notes: "yum",
        },
      };
      const res = createRes();
      const next = jest.fn();
      const entry = { diaryEntryId: 10 };

      mockCreateDiaryEntry.mockResolvedValue(entry);

      await createEntry(req, res, next);

      expect(mockCreateDiaryEntry).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
        consumedAt: req.body.consumedAt,
        mealType: req.body.mealType,
        notes: req.body.notes,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ entry });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when subscriberId is missing", async () => {
      const req = {
        user: {},
        body: {
          consumedAt: "2026-04-18",
          mealType: "breakfast",
          notes: "yum",
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(
        new DiaryEntryError("Subscriber ID is required")
      );

      await createEntry(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Subscriber ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when consumedAt is missing", async () => {
      const req = {
        user: { userId: TEST_USERID },
        body: {
          mealType: "breakfast",
          notes: "yum",
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(
        new DiaryEntryError("Consumed at date is required")
      );

      await createEntry(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Consumed at date is required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when mealType is invalid", async () => {
      const req = {
        user: { userId: TEST_USERID },
        body: {
          consumedAt: "2026-04-18",
          mealType: "brunch",
          notes: "yum",
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(
        new DiaryEntryError(
          "Meal type is required and must be one of: breakfast, lunch, dinner, snack"
        )
      );

      await createEntry(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Meal type is required and must be one of: breakfast, lunch, dinner, snack",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("getSummary", () => {
    test("returns 200 and gets nutritional summary when successful", async () => {
      const req = {
        user: { userId: TEST_USERID },
        query: {
          period: "daily",
          endDate: "2026-04-18T23:59:59.999Z",
        },
      };
      const res = createRes();
      const next = jest.fn();
      const summary = { diaryEntryId: TEST_ENTRYID };

      mockGetNutritionSummary.mockResolvedValue(summary);

      await getSummary(req, res, next);

      expect(mockGetNutritionSummary).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
        period: req.query.period,
        endDate: req.query.endDate,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ summary });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when subscriberId is missing", async () => {
      const req = {
        user: {},
        query: {
          period: "daily",
          endDate: "2026-04-18",
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockGetNutritionSummary.mockRejectedValue(
        new DiaryEntryError("Subscriber ID is required")
      );

      await getSummary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Subscriber ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when period is invalid", async () => {
      const req = {
        user: { userId: TEST_USERID },
        query: {
          period: "every week",
          endDate: "2026-04-18",
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockGetNutritionSummary.mockRejectedValue(
        new DiaryEntryError(
          "Period is required and must be one of: daily, weekly, monthly"
        )
      );

      await getSummary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Period is required and must be one of: daily, weekly, monthly",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when endDate is invalid", async () => {
      const req = {
        user: { userId: TEST_USERID },
        query: {
          period: "daily",
          endDate: "bad-date",
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockGetNutritionSummary.mockRejectedValue(
        new DiaryEntryError("endDate is required and must be a valid date")
      );

      await getSummary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "endDate is required and must be a valid date",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("listDiaryEntries", () => {
    test("returns 200 and lists diary entries when successful", async () => {
      const req = {
        user: { userId: TEST_USERID },
        query: {
          consumedAt: "2026-04-18",
          mealType: "breakfast",
          notes: "yum",
        },
      };
      const res = createRes();
      const next = jest.fn();
      const record = [{ diaryEntryId: 1 }, { diaryEntryId: 2 }];

      mockListDiaryEntries.mockResolvedValue(record);

      await listDiaryEntries(req, res, next);

      expect(mockListDiaryEntries).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
        consumedAt: "2026-04-18",
        mealType: "breakfast",
        notes: "yum",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ record });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when subscriberId is missing", async () => {
      const req = {
        user: {},
        query: {
          consumedAt: "2026-04-18",
          mealType: "breakfast",
          notes: "yum",
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(
        new DiaryEntryError("Subscriber ID is required")
      );

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Subscriber ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when mealType is invalid", async () => {
      const req = {
        user: { userId: TEST_USERID },
        query: {
          consumedAt: "2026-04-18",
          mealType: "brunch",
          notes: "yum",
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(
        new DiaryEntryError(
          "Meal type must be one of: breakfast, lunch, dinner, snack"
        )
      );

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Meal type must be one of: breakfast, lunch, dinner, snack",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when notes is invalid", async () => {
      const req = {
        user: { userId: TEST_USERID },
        query: {
          consumedAt: "2026-04-18",
          notes: 30,
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(
        new DiaryEntryError("Notes must be a string")
      );

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Notes must be a string",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("getDiaryEntryById", () => {
    test("returns 200 and gets diary entry by ID when successful", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {
          id: TEST_ENTRYID,
        },
        query: {},
      };
      const res = createRes();
      const next = jest.fn();
      const entry = { diaryEntryId: TEST_ENTRYID };

      mockGetDiaryEntryById.mockResolvedValue(entry);

      await getDiaryEntryById(req, res, next);

      expect(mockGetDiaryEntryById).toHaveBeenCalledWith({
        diaryEntryId: TEST_ENTRYID,
        type: undefined,
        unit: undefined,
        quantityG: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ entry });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when diaryEntryId is missing", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {},
        query: {},
      };
      const res = createRes();
      const next = jest.fn();

      mockGetDiaryEntryById.mockRejectedValue(
        new DiaryEntryError("Diary Entry ID is required")
      );

      await getDiaryEntryById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Diary Entry ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("createDiaryEntryItem", () => {
    test("returns 201 and creates new diary entry item", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          quantityG: 30,
          foodItemId: TEST_ID,
        },
      };
      const res = createRes();
      const next = jest.fn();
      const newItem = { diaryEntryId: TEST_ENTRYITEMID };

      mockCreateDiaryEntryItem.mockResolvedValue(newItem);

      await createDiaryEntryItem(req, res, next);

      expect(mockCreateDiaryEntryItem).toHaveBeenCalledWith({
        userId: TEST_USERID,
        diaryEntryId: Number(req.params.id),
        quantityG: req.body.quantityG,
        foodItemId: req.body.foodItemId,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ newItem });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when userId is missing", async () => {
      const req = {
        user: {},
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          quantityG: 30,
          foodItemId: TEST_ID,
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(
        new DiaryEntryError("User ID is required")
      );

      await createDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "User ID is required" });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when diaryEntryId is missing", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {},
        body: {
          quantityG: 30,
          foodItemId: TEST_ID,
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(
        new DiaryEntryError("Diary Entry ID is required")
      );

      await createDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Diary Entry ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when quantityG is missing", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          foodItemId: TEST_ID,
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(
        new DiaryEntryError(
          "Quantity in grams is required and must be a positive number"
        )
      );

      await createDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Quantity in grams is required and must be a positive number",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when quantityG is invalid", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          quantityG: -30,
          foodItemId: TEST_ID,
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(
        new DiaryEntryError(
          "Quantity in grams is required and must be a positive number"
        )
      );

      await createDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Quantity in grams is required and must be a positive number",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when foodItemId is missing", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          quantityG: 30,
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(
        new DiaryEntryError("Food Item ID is required")
      );

      await createDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Food Item ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when unauthorised access error is thrown", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          quantityG: 30,
          foodItemId: TEST_ID,
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(
        new DiaryEntryError("Unauthorised access")
      );

      await createDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Unauthorised access",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("updateDiaryEntryItem", () => {
    test("returns 200 and updates diary entry item when successful", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {
          itemId: TEST_ENTRYITEMID,
        },
        body: {
          quantityG: 50,
          foodItemId: TEST_ID,
        },
      };
      const res = createRes();
      const next = jest.fn();
      const updatedEntry = { id: TEST_ENTRYITEMID };

      mockUpdateDiaryEntryItem.mockResolvedValue(updatedEntry);

      await updateDiaryEntryItem(req, res, next);

      expect(mockUpdateDiaryEntryItem).toHaveBeenCalledWith({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        foodItemId: TEST_ID,
        quantityG: 50,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ updatedEntry });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when item id is missing", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {},
        body: {
          quantityG: 50,
          foodItemId: TEST_ID,
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockUpdateDiaryEntryItem.mockRejectedValue(
        new DiaryEntryError("Diary Entry ID is required")
      );

      await updateDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Diary Entry ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when user id is missing", async () => {
      const req = {
        user: {},
        params: {
          itemId: TEST_ENTRYITEMID,
        },
        body: {
          quantityG: 50,
          foodItemId: TEST_ID,
        },
      };
      const res = createRes();
      const next = jest.fn();

      mockUpdateDiaryEntryItem.mockRejectedValue(
        new DiaryEntryError("User ID is required")
      );

      await updateDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "User ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("deleteEntry", () => {
    test("returns 200 and deletes diary entry when successful", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {
          id: TEST_ENTRYID,
        },
      };
      const res = createRes();
      const next = jest.fn();
      const deleted = { diaryEntryId: TEST_ENTRYID };

      mockDeleteExistingDiaryEntry.mockResolvedValue(deleted);

      await deleteEntry(req, res, next);

      expect(mockDeleteExistingDiaryEntry).toHaveBeenCalledWith({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ deleteEntry: deleted });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when diary entry id is missing", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {},
      };
      const res = createRes();
      const next = jest.fn();

      mockDeleteExistingDiaryEntry.mockRejectedValue(
        new DiaryEntryError("Diary Entry ID is required")
      );

      await deleteEntry(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Diary Entry ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("deleteEntryItem", () => {
    test("returns 200 and deletes diary entry item when successful", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {
          itemId: TEST_ENTRYITEMID,
        },
      };
      const res = createRes();
      const next = jest.fn();
      const deleted = { diaryEntryItemId: TEST_ENTRYITEMID };

      mockDeleteExistingDiaryEntryItem.mockResolvedValue(deleted);

      await deleteEntryItem(req, res, next);

      expect(mockDeleteExistingDiaryEntryItem).toHaveBeenCalledWith({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ deleteItem: deleted });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns 400 when diary entry item id is missing", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {},
      };
      const res = createRes();
      const next = jest.fn();

      mockDeleteExistingDiaryEntryItem.mockRejectedValue(
        new DiaryEntryError("Diary Entry Item ID is required")
      );

      await deleteEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Diary Entry Item ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});