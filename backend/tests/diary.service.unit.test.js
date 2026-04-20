import { jest } from "@jest/globals";

const mockValidateCreateDiaryEntryInput = jest.fn();
const mockValidateListDisplay = jest.fn();
const mockValidateEntryDetails = jest.fn();

const mockInsertDiaryEntry = jest.fn();
const mockListDiaryEntriesRepo = jest.fn();
const mockFindDiaryEntryById = jest.fn();

jest.unstable_mockModule("../src/modules/diary/diary.validator.js", () => ({
  validateCreateDiaryEntryInput: mockValidateCreateDiaryEntryInput,
  validateSummaryInput: jest.fn(),
  validateListDisplay: mockValidateListDisplay,
  validateNewEntryDetails: jest.fn(),
  validateUpdatedEntryItem: jest.fn(),
  validateDeletedDiaryEntry: jest.fn(),
  validateEntryDetails: mockValidateEntryDetails,
  validateDeletedDiaryEntryItem: jest.fn(),
  DiaryEntryError: class DiaryEntryError extends Error {},
}));

jest.unstable_mockModule("../src/modules/diary/diary.repository.js", () => ({
  fetchSummaryData: jest.fn(),
  insertDiaryEntry: mockInsertDiaryEntry,
  listDiaryEntries: mockListDiaryEntriesRepo,
  findDiaryEntryById: mockFindDiaryEntryById,
  createDiaryEntryItem: jest.fn(),
  updateDiaryEntryItem: jest.fn(),
  deleteDiaryEntry: jest.fn(),
  deleteDiaryEntryItem: jest.fn(),
}));

const {
  createDiaryEntry,
  listDiaryEntries,
  getDiaryEntryById,
} = await import("../src/modules/diary/diary.service.js");

describe("Diary service unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createDiaryEntry", () => {
    test("validates input then inserts diary entry", async () => {
      const input = {
        subscriberId: 1,
        consumedAt: "2026-04-19T12:00:00.000Z",
        mealType: "breakfast",
        notes: "test",
      };

      const validated = {
        subscriberId: 1,
        consumedAt: new Date("2026-04-19T12:00:00.000Z"),
        mealType: "breakfast",
        notes: "test",
      };

      const inserted = { diaryEntryId: 99, ...validated };

      mockValidateCreateDiaryEntryInput.mockReturnValue(validated);
      mockInsertDiaryEntry.mockResolvedValue(inserted);

      const result = await createDiaryEntry(input);

      expect(mockValidateCreateDiaryEntryInput).toHaveBeenCalledWith(input);
      expect(mockInsertDiaryEntry).toHaveBeenCalledWith(validated);
      expect(result).toEqual(inserted);
    });
  });

  describe("listDiaryEntries", () => {
    test("validates filters then returns repository result", async () => {
      const input = {
        subscriberId: 1,
        consumedAt: "2026-04-19",
        mealType: "breakfast",
        notes: "abc",
      };

      const validated = {
        subscriberId: 1,
        consumedAt: new Date("2026-04-19"),
        mealType: "breakfast",
        notes: "abc",
      };

      const entries = [{ diaryEntryId: 1 }, { diaryEntryId: 2 }];

      mockValidateListDisplay.mockReturnValue(validated);
      mockListDiaryEntriesRepo.mockResolvedValue(entries);

      const result = await listDiaryEntries(input);

      expect(mockValidateListDisplay).toHaveBeenCalledWith(input);
      expect(mockListDiaryEntriesRepo).toHaveBeenCalledWith(validated);
      expect(result).toEqual(entries);
    });
  });

  describe("getDiaryEntryById", () => {
    test("validates diaryEntryId then returns entry", async () => {
      const input = { diaryEntryId: 7 };
      const validated = { diaryEntryId: 7 };
      const entry = { diaryEntryId: 7, items: [] };

      mockValidateEntryDetails.mockReturnValue(validated);
      mockFindDiaryEntryById.mockResolvedValue(entry);

      const result = await getDiaryEntryById(input);

      expect(mockValidateEntryDetails).toHaveBeenCalledWith(input);
      expect(mockFindDiaryEntryById).toHaveBeenCalledWith(validated);
      expect(result).toEqual(entry);
    });
  });
});