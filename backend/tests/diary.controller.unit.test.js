// tests/diary.controller.unit.test.js
import { expect, jest } from "@jest/globals";
import { DiaryEntryError } from "../src/modules/diary/diary.validator.js";

// Mocks
const TEST_ID = 1;
const TEST_USERID = 2;
const TEST_ENTRYID = 3;
const TEST_ENTRYITEMID = 4;
const TEST_FAIL_ENTRYITEMID = 321;

// diary.service mock functions
const mockCreateDiaryEntry = jest.fn();
const mockGetNutritionSummary = jest.fn();
const mockListDiaryEntries = jest.fn();
const mockGetDiaryEntryById = jest.fn();
const mockCreateDiaryEntryItem = jest.fn();
const mockCreateRecipeAsDiaryEntryItemService = jest.fn();
const mockUpdateDiaryEntryItem = jest.fn();
const mockDeleteExistingDiaryEntry = jest.fn();
const mockDeleteExistingDiaryEntryItem = jest.fn();
const mockCreateFoodItem = jest.fn();
const mockCreateFoodPortion = jest.fn();
const mockGetDashboardDataForSubscriber = jest.fn();

jest.unstable_mockModule("../src/modules/diary/diary.service.js", () => ({
  createDiaryEntry: mockCreateDiaryEntry,
  getNutritionSummary: mockGetNutritionSummary,
  listDiaryEntries: mockListDiaryEntries,
  getDiaryEntryById: mockGetDiaryEntryById,
  createDiaryEntryItem: mockCreateDiaryEntryItem,
  createRecipeAsDiaryEntryItemService: mockCreateRecipeAsDiaryEntryItemService,
  updateDiaryEntryItem: mockUpdateDiaryEntryItem,
  deleteExistingDiaryEntry: mockDeleteExistingDiaryEntry,
  deleteExistingDiaryEntryItem: mockDeleteExistingDiaryEntryItem,
  createFoodItem: mockCreateFoodItem,
  createFoodPortion: mockCreateFoodPortion,
  getDashboardDataForSubscriber: mockGetDashboardDataForSubscriber,
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
  getDashboard,
  createEntryWithRecipe,
  createRecipeAsDiaryEntryItem,
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
    test("Returns status code 201 and creates new diary entry when successful", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        body: {
          consumedAt: "2026-4-18",
          mealType: "breakfast",
          notes: "yum",
          items: [],
        }
      };
      const res = createRes();
      const next = jest.fn();
      const entry = {
        diaryEntryId: 10
      };

      mockCreateDiaryEntry.mockResolvedValue(entry);

      await createEntry(req,res,next);

      expect(mockCreateDiaryEntry).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
        consumedAt: req.body.consumedAt,
        mealType: req.body.mealType,
        notes: req.body.notes,
        items: req.body.items,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ entry });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status 201 and creates new diary entry and items contains a valid portionId", async () => {
      const req = {
        user: { userId: TEST_USERID
        },
        body: {
          consumedAt: "2026-4-18",
          mealType: "breakfast",
          notes: "yum",
          items: [{ quantity: 1, portionId: 1 }],
        }
      };
      const res = createRes();
      const next = jest.fn();
      const entry = {
        diaryEntryId: TEST_ENTRYID,
      };

      mockCreateDiaryEntry.mockResolvedValue(entry);

      await createEntry(req, res, next);

      expect(mockCreateDiaryEntry).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
        consumedAt: req.body.consumedAt,
        mealType: req.body.mealType,
        notes: req.body.notes,
        items: req.body.items,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ entry });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when subscriberId is missing", async () => {
      const req = {
        user: {
        },
        body: {
          consumedAt: "2026-4-18",
          mealType: "breakfast",
          notes: "yum",
          items: [],
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(new DiaryEntryError("Subscriber ID is required"));

      await createEntry(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Subscriber ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when consumedAt is missing", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        body: {
          mealType: "breakfast",
          notes: "yum",
          items: [],
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(new DiaryEntryError("Consumed at date is required"));

      await createEntry(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Consumed at date is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when consumedAt is invalid", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        body: {
          consumedAt: "not-a-date",
          mealType: "breakfast",
          notes: "yum",
          items: [],
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(new DiaryEntryError("Consumed at date is required"));

      await createEntry(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Consumed at date is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when mealType is missing", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        body: {
          consumedAt: "2026-4-18",
          notes: "yum",
          items: [],
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(
        new DiaryEntryError("Meal type is required and must be one of: breakfast, lunch, dinner, snack")
      );

      await createEntry(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Meal type is required and must be one of: breakfast, lunch, dinner, snack",
      });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when mealType is invalid", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        body: {
          consumedAt: "2026-4-18",
          mealType: "brunch",
          notes: "yum",
          items: [],
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(
        new DiaryEntryError("Meal type is required and must be one of: breakfast, lunch, dinner, snack")
      );

      await createEntry(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Meal type is required and must be one of: breakfast, lunch, dinner, snack",
      });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when item contains a non-positive number", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        body: {
          consumedAt: "2026-4-18",
          mealType: "brunch",
          notes: "yum",
          items: [{ quantity: -1, portionId: 1 }],
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(
        new DiaryEntryError("Item at index 0: quantity must be a positive number")
      );

      await createEntry(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Item at index 0: quantity must be a positive number",
      });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when item has no portionId, custom_food, or fat_secret", async () => {
      const req = {
        user: { userId: TEST_USERID
        },
        body: {
          consumedAt: "2026-4-18",
          mealType: "breakfast",
          notes: "yum",
          items: [{ quantity: 1 }],
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(
        new DiaryEntryError("Item at index 0: must provide either portionId, be a custom_food, or have fat_secret information")
      );

      await createEntry(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Item at index 0: must provide either portionId, be a custom_food, or have fat_secret information",
      });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when fat_secret item is missing external_id", async () => {
      const req = {
        user: { userId: TEST_USERID
        },
        body: {
          consumedAt: "2026-4-18",
          mealType: "breakfast",
          notes: "yum",
          items: [{ quantity: 1, fat_secret: {} }],
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(
        new DiaryEntryError("Item at index 0: must provide fat_secret external_id")
      );

      await createEntry(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Item at index 0: must provide fat_secret external_id",
      });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns error code 400 when item has invalid portionId", async () => {
      const req = {
        user: { userId: TEST_USERID },
        body: {
          consumedAt: "2026-4-18",
          mealType: "breakfast",
          notes: "yum",
          items: [{ quantity: 1, portionId: -5 }],
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(
        new DiaryEntryError("Item at index 0: invalid portionId")
      );

      await createEntry(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Item at index 0: invalid portionId",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("getSummary", () => {
    test("Returns status code 200 and gets the nutritional summary when successful", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        query: {
          period: "daily",
          endDate: "2026-4-18T23:59:59.999Z",
        }
      };
      const res = createRes();
      const next = jest.fn();
      const entry = {
        diaryEntryId: TEST_ENTRYID
      };

      mockGetNutritionSummary.mockResolvedValue(entry);

      await getSummary(req,res,next);

      expect(mockGetNutritionSummary).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
        period: req.query.period,
        endDate: req.query.endDate,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ summary: entry });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns status code 400 when subscriberId is missing", async () => {
      const req = {
        user: {
        },
        body: {
          period: "daily",
          endDate: "2026-4-18",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockGetNutritionSummary.mockRejectedValue(new DiaryEntryError("Subscriber ID is required"));

      await getSummary(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Subscriber ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when period is missing", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        body: {
          endDate: "2026-4-18",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockGetNutritionSummary.mockRejectedValue(new DiaryEntryError("Period is required and must be one of: daily, weekly, monthly"));

      await getSummary(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Period is required and must be one of: daily, weekly, monthly" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when period is not a valid duration", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        body: {
          period: "every week",
          endDate: "2026-4-18",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockGetNutritionSummary.mockRejectedValue(new DiaryEntryError("Period is required and must be one of: daily, weekly, monthly"));

      await getSummary(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Period is required and must be one of: daily, weekly, monthly" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when endDate is missing", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        body: {
          period: "daily",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockGetNutritionSummary.mockRejectedValue(new DiaryEntryError("endDate is required and must be a valid date"));

      await getSummary(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "endDate is required and must be a valid date" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when endDate is not a valid date", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        body: {
          period: "daily",
          endDate: "bad-date"
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockGetNutritionSummary.mockRejectedValue(new DiaryEntryError("endDate is required and must be a valid date"));

      await getSummary(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "endDate is required and must be a valid date" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Calls next with error that is not DiaryEntryError", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        query: {
          period: "daily",
          endDate: "2026-4-18T23:59:59.999Z",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockGetNutritionSummary.mockRejectedValue(new Error("Unexpected error"));

      await getSummary(req,res,next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Unexpected error" }));
    });
  });

  describe("listDiaryEntries", () => {
    test("Returns status code 200 and lists all existing diary entries", async () => {
      const req = {
        user: { userId: TEST_USERID
        },
        query: {
          start: "2026-04-18",
          end: "2026-04-18T23:59:59.999Z",
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
        start: "2026-04-18",
        end: "2026-04-18T23:59:59.999Z",
        mealType: "breakfast",
        notes: "yum",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ record });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when subscriberId is missing", async () => {
      const req = {
        user: {
        },
        query: {
          start: "2026-04-18",
          end: "2026-04-19",
          mealType: "breakfast",
          notes: "yum",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(new DiaryEntryError("Subscriber ID is required"));

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Subscriber ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when start is not a valid date", async () => {
      const req = { 
        user: { userId: TEST_USERID
        },
        query: {
          start: "invalid-date",
          end: "2026-04-18T23:59:59.999Z",
          mealType: "breakfast",
          notes: "yum",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(new DiaryEntryError("Start date must be a valid date"));

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Start date must be a valid date" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when start is a future date", async () => {
      const req = {
        user: { userId: TEST_USERID
        },
        query: {
          start: "2100-04-19",
          end: "2026-05-11T23:59:59.999Z",
          mealType: "breakfast",
          notes: "yum",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(new DiaryEntryError("Start date cannot be in the future"));

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Start date cannot be in the future" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when end is not a valid date", async () => {
      const req = {
        user: { userId: TEST_USERID
        },
        query: {
          start: "2026-04-18",
          end: "invalid-date",
          mealType: "breakfast",
          notes: "yum",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(new DiaryEntryError("End date must be a valid date"));

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "End date must be a valid date" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when end is before start date", async () => {
      const req = {
        user: { userId: TEST_USERID
        }, 
        query: {
          start: "2026-04-19",
          endDate: "2026-04-18T23:59:59.999Z",
          mealType: "breakfast",
          notes: "yum",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(new DiaryEntryError("End date cannot be before start date"));

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "End date cannot be before start date" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when mealType is missing", async () => {
      const req = {
        user: { userId: TEST_USERID
        }, 
        query: {
          start: "2026-04-18",
          endDate: "2026-04-18T23:59:59.999Z",
          notes: "yum",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(new DiaryEntryError("Meal type must be one of: breakfast, lunch, dinner, snack"));

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Meal type must be one of: breakfast, lunch, dinner, snack" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when mealType is invalid", async () => {
      const req = {
        user: { userId: TEST_USERID
        }, 
        query: {
          start: "2026-04-18",
          endDate: "2026-04-18T23:59:59.999Z",
          mealType: "brunch",
          notes: "yum",
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(new DiaryEntryError("Meal type must be one of: breakfast, lunch, dinner, snack"));

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Meal type must be one of: breakfast, lunch, dinner, snack" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when notes is invalid", async () => {
      const req = {
        user: { userId: TEST_USERID
        }, 
        query: {
          start: "2026-04-18",
          endDate: "2026-04-18T23:59:59.999Z",
          notes: 30,
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(new DiaryEntryError("Notes must be a string"));

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Notes must be a string" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Calls next when listDiaryEntries fails unexpectedly that is not a DiaryEntryError", async () => {
      const req = {
        user: { userId: TEST_USERID },
        query: {}
      };
      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockRejectedValue(new Error("Unexpected error"));

      await listDiaryEntries(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: "Unexpected error" }));
    });
  });

  describe("getDiaryEntryById", () => {
    test("Returns status code 200 and gets diary entry by ID when successful", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        params: {
          id: TEST_ENTRYID,
        }
      };
      const res = createRes();
      const next = jest.fn();
      const entry = {
        diaryEntryId: TEST_ENTRYID
      };

      mockGetDiaryEntryById.mockResolvedValue(entry);

      await getDiaryEntryById(req,res,next);

      expect(mockGetDiaryEntryById).toHaveBeenCalledWith({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ entry });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns status code 400 when diaryEntryId is missing", async () => {
      const req = {
          user: { userId: TEST_USERID,
          },
          params: {
          },
        };
      const res = createRes();
      const next = jest.fn();

      mockGetDiaryEntryById.mockRejectedValue(new DiaryEntryError("Diary Entry ID is required"));

      await getDiaryEntryById(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Diary Entry ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when subscriberId is missing", async () => {
      const req = {
          user: {
          },
          params: {
            id: TEST_ENTRYID,
          },
        };
      const res = createRes();
      const next = jest.fn();

      mockGetDiaryEntryById.mockRejectedValue(new DiaryEntryError("Subscriber ID is required"));

      await getDiaryEntryById(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Subscriber ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Calls next when generic error with getDiaryEntryById fails unexpectedly that is not DiaryEntryError", async () => {
      const req = {
          user: { userId: TEST_USERID },
          params: {
            id: TEST_ENTRYID,
          },
        };
      const res = createRes();
      const next = jest.fn();
      const error = new Error("Unexpected error");

      mockGetDiaryEntryById.mockRejectedValue(error);

      await getDiaryEntryById(req,res,next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createDiaryEntryItem", () => {
    test("Returns status code 201 and create new diary entry item", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          quantity: 30,
          portionId: TEST_ID,
          customFood: null,
          fatSecret: null,
        }
      };
      const res = createRes();
      const next = jest.fn();
      const entry = {
        diaryEntryId: TEST_ENTRYITEMID
      };

      mockCreateDiaryEntryItem.mockResolvedValue(entry);

      await createDiaryEntryItem(req,res,next);

      expect(mockCreateDiaryEntryItem).toHaveBeenCalledWith({
        userId: TEST_USERID,
        diaryEntryId: Number(req.params.id),
        quantity: req.body.quantity,
        portionId: req.body.portionId,
        customFood: req.body.customFood,
        fatSecret: req.body.fatSecret,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ newItem: entry });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when userId is missing", async () => {
      const req = {
        user: {
        },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          quantity: 30,
          portionId: TEST_ID,
          customFood: null,
          fatSecret: null,
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(new DiaryEntryError("User ID is required"));

      await createDiaryEntryItem(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "User ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when diaryEntryId is missing", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        params: {
        },
        body: {
          quantity: 30,
          portionId: TEST_ID,
          customFood: null,
          fatSecret: null,
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(new DiaryEntryError("Diary Entry ID is required"));

      await createDiaryEntryItem(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Diary Entry ID is required" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 403 when input fails diary ownership check", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        params: {
          id: TEST_FAIL_ENTRYITEMID,
        },
        body: {
          quantity: 30,
          portionId: TEST_ID,
          customFood: null,
          fatSecret: null,
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(new DiaryEntryError("Unauthorised access"));

      await createDiaryEntryItem(req,res,next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorised access" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when quantity is missing", async () => {
      const req = {
        user: {
          userId: TEST_USERID,
        },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          portionId: TEST_ID,
          customFood: null,
          fatSecret: null,
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(new DiaryEntryError("Quantity is required and must be a positive number"));

      await createDiaryEntryItem(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Quantity is required and must be a positive number" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when quantity is not a positive number", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          quantity: -30,
          portionId: TEST_ID,
          customFood: null,
          fatSecret: null,
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(new DiaryEntryError("Quantity is required and must be a positive number"));

      await createDiaryEntryItem(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Quantity is required and must be a positive number" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when portionId is missing", async () => {
      const req = {
        user: { userId: TEST_USERID,
        },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          quantity: 30,
          customFood: null,
          fatSecret: null,
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(new DiaryEntryError("Portion ID is required and must be a positive number"));

      await createDiaryEntryItem(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Portion ID is required and must be a positive number" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when portionId is not a positive number", async () => {
      const req = {
        user: {
          userId: TEST_USERID,
        },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          quantity: 30,
          portionId: -1,
          customFood: null,
          fatSecret: null,
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(new DiaryEntryError("Portion ID is required and must be a positive number"));

      await createDiaryEntryItem(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Portion ID is required and must be a positive number" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Returns status code 400 when no portionId, customFood, or fatSecret is provided", async () => {
      const req = {
        user: { userId: TEST_USERID
        },
        params: {
          id: TEST_ENTRYITEMID
        },
        body: {
          quantity: 30,
          portionId: null,
          customFood: null,
          fatSecret: null,
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockRejectedValue(
        new DiaryEntryError("Must provide either portionId, customFood, or fatSecret")
      );

      await createDiaryEntryItem(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Must provide either portionId, customFood, or fatSecret" });
      expect(next).not.toHaveBeenCalled();
    });
    test("Calls next when generic error with createDiaryEntryItem failing unexpectedly that is not a DiaryEntryError", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: {
          id: TEST_ENTRYITEMID,
        },
        body: {
          quantity: 30,
          portionId: TEST_ID,
          customFood: null,
          fatSecret: null,
        }
      };
      const res = createRes();
      const next = jest.fn();
      const error = new Error("Unexpected error");

      mockCreateDiaryEntryItem.mockRejectedValue(error);

      await createDiaryEntryItem(req,res,next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateDiaryEntryItem", () => {
    test("Returns status code 200 and updates diary entry item", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { itemId: TEST_ENTRYITEMID },
        body: {
          portionId: TEST_ID,
          quantity: 30,
        },
      };
      const res = createRes();
      const next = jest.fn();
      const updatedItem = { diaryEntryItemId: TEST_ENTRYITEMID };

      mockUpdateDiaryEntryItem.mockResolvedValue(updatedItem);

      await updateDiaryEntryItem(req, res, next);

      expect(mockUpdateDiaryEntryItem).toHaveBeenCalledWith({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: TEST_ID,
        quantity: 30,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ updatedEntry: updatedItem });
      expect(next).not.toHaveBeenCalled();
    });

    test("Returns status code 400 when service throws DiaryEntryError", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { itemId: TEST_ENTRYITEMID },
        body: {},
      };
      const res = createRes();
      const next = jest.fn();

      mockUpdateDiaryEntryItem.mockRejectedValue(
        new DiaryEntryError("Diary Entry Item ID is required")
      );

      await updateDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Diary Entry Item ID is required",
      });
      expect(next).not.toHaveBeenCalled();
    });
    test("Calls next when generic error with updateDiaryEntryItem failing unexpectedly that is not a DiaryEntryError", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { itemId: TEST_ENTRYITEMID },
        body: {},
      };
      const res = createRes();
      const next = jest.fn();
      const error = new Error("Unexpected error");

      mockUpdateDiaryEntryItem.mockRejectedValue(error);

      await updateDiaryEntryItem(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteEntry", () => {
    test("Returns status code 200 and deletes diary entry", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { id: TEST_ENTRYID },
      };
      const res = createRes();
      const next = jest.fn();
      const deletedEntry = { diaryEntryId: TEST_ENTRYID };

      mockDeleteExistingDiaryEntry.mockResolvedValue(deletedEntry);

      await deleteEntry(req, res, next);

      expect(mockDeleteExistingDiaryEntry).toHaveBeenCalledWith({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ deleteEntry: deletedEntry });
      expect(next).not.toHaveBeenCalled();
    });

    test("Returns status code 400 when service throws DiaryEntryError", async () => {
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
    test("Calls next when generic error with deleteEntry failing unexpectedly that is not a DiaryEntryError", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { id: TEST_ENTRYID },
      };
      const res = createRes();
      const next = jest.fn();
      const error = new Error("Unexpected error");

      mockDeleteExistingDiaryEntry.mockRejectedValue(error);

      await deleteEntry(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteEntryItem", () => {
    test("Returns status code 200 and deletes diary entry item", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { itemId: TEST_ENTRYITEMID },
      };
      const res = createRes();
      const next = jest.fn();
      const deletedItem = { diaryEntryItemId: TEST_ENTRYITEMID };

      mockDeleteExistingDiaryEntryItem.mockResolvedValue(deletedItem);

      await deleteEntryItem(req, res, next);

      expect(mockDeleteExistingDiaryEntryItem).toHaveBeenCalledWith({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ deleteItem: deletedItem });
      expect(next).not.toHaveBeenCalled();
    });

    test("Returns status code 400 when service throws DiaryEntryError", async () => {
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
    test("Calls next when generic error with deleteEntryItem failing unexpectedly that is not a DiaryEntryError", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { itemId: TEST_ENTRYITEMID },
      };
      const res = createRes();
      const next = jest.fn();
      const error = new Error("Unexpected error");

      mockDeleteExistingDiaryEntryItem.mockRejectedValue(error);

      await deleteEntryItem(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getDashboard", () => {
    test("Returns status code 200 and gets user dashboard", async () => {
      const req = {
        user: { userId: TEST_USERID,
        }
      };
      const res = createRes();
      const next = jest.fn();
      const entry = {
        diaryEntryId: TEST_ENTRYID
      };

      mockGetDashboardDataForSubscriber.mockResolvedValue(entry);

      await getDashboard(req,res,next);

      expect(mockGetDashboardDataForSubscriber).toHaveBeenCalledWith({
        subscriberId: TEST_USERID,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ dashboardData: entry });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Returns status code 400 when subscriberId is missing", async () => {
      const req = {
        user: { userId: TEST_USERID,
        }
      };
      const res = createRes();
      const next = jest.fn();

      mockGetDashboardDataForSubscriber.mockRejectedValue(new DiaryEntryError("Subscriber ID is required"));

      await getDashboard(req,res,next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Subscriber ID is required" });
      expect(next).not.toHaveBeenCalledWith();
    });
    test("Calls next when generic error with getDashboard failing unexpectedly that is not a DiaryEntryError", async () => {
      const req = {
        user: { userId: TEST_USERID,
        }
      };
      const res = createRes();
      const next = jest.fn();
      const error = new Error("Unexpected error");

      mockGetDashboardDataForSubscriber.mockRejectedValue(error);

      await getDashboard(req,res,next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
