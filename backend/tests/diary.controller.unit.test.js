// tests/diary.controller.unit.test.js
import { expect, jest } from "@jest/globals";
import { DiaryEntryError } from "../src/modules/diary/diary.validator.js";

const TEST_ID = 1;
const TEST_USERID = 2;
const TEST_ENTRYID = 3;
const TEST_ENTRYITEMID = 4;

// ===== mocks =====
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

  // ================= createEntry =================
  describe("createEntry", () => {
    test("returns 201 when successful", async () => {
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

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ entry });
    });

    test("returns 400 when subscriberId missing", async () => {
      const req = { user: {}, body: {} };
      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntry.mockRejectedValue(
        new DiaryEntryError("Subscriber ID is required")
      );

      await createEntry(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ================= getSummary =================
  describe("getSummary", () => {
    test("returns 200", async () => {
      const req = {
        user: { userId: TEST_USERID },
        query: {
          period: "daily",
          endDate: "2026-04-18",
        },
      };

      const res = createRes();
      const next = jest.fn();

      mockGetNutritionSummary.mockResolvedValue({});

      await getSummary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ================= listDiaryEntries =================
  describe("listDiaryEntries", () => {
    test("returns 200", async () => {
      const req = {
        user: { userId: TEST_USERID },
        query: {
          consumedAt: "2026-04-18",
        },
      };

      const res = createRes();
      const next = jest.fn();

      mockListDiaryEntries.mockResolvedValue([]);

      await listDiaryEntries(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ================= getDiaryEntryById =================
  describe("getDiaryEntryById", () => {
    test("returns 200", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { id: TEST_ENTRYID },
        query: {},
      };

      const res = createRes();
      const next = jest.fn();

      mockGetDiaryEntryById.mockResolvedValue({});

      await getDiaryEntryById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ================= createDiaryEntryItem =================
  describe("createDiaryEntryItem", () => {
    test("returns 201", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { id: TEST_ENTRYITEMID },
        body: {
          quantityG: 30,
          foodItemId: TEST_ID,
        },
      };

      const res = createRes();
      const next = jest.fn();

      mockCreateDiaryEntryItem.mockResolvedValue({});

      await createDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ================= update =================
  describe("updateDiaryEntryItem", () => {
    test("returns 200", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { itemId: TEST_ENTRYITEMID },
        body: {
          quantityG: 50,
          foodItemId: TEST_ID,
        },
      };

      const res = createRes();
      const next = jest.fn();

      mockUpdateDiaryEntryItem.mockResolvedValue({});

      await updateDiaryEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ================= deleteEntry =================
  describe("deleteEntry", () => {
    test("returns 200", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { id: TEST_ENTRYID },
      };

      const res = createRes();
      const next = jest.fn();

      mockDeleteExistingDiaryEntry.mockResolvedValue({});

      await deleteEntry(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ================= deleteItem =================
  describe("deleteEntryItem", () => {
    test("returns 200", async () => {
      const req = {
        user: { userId: TEST_USERID },
        params: { itemId: TEST_ENTRYITEMID },
      };

      const res = createRes();
      const next = jest.fn();

      mockDeleteExistingDiaryEntryItem.mockResolvedValue({});

      await deleteEntryItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});