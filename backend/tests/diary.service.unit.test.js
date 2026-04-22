import { describe, test, expect, jest, beforeEach } from "@jest/globals";

const TEST_USERID = 2;
const TEST_ENTRYID = 3;
const TEST_ENTRYITEMID = 4;

class DiaryEntryError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiaryEntryError";
  }
}

// ===== validator mocks =====
const mockValidateCreateDiaryEntryInput = jest.fn();
const mockValidateSummaryInput = jest.fn();
const mockValidateListDisplay = jest.fn();
const mockValidateNewEntryDetails = jest.fn();
const mockValidateUpdatedEntryItem = jest.fn();
const mockValidateDeletedDiaryEntry = jest.fn();
const mockValidateEntryDetails = jest.fn();
const mockValidateDeletedDiaryEntryItem = jest.fn();
const mockValidateUserIdForDashboard = jest.fn();
const mockValidateCreateFoodItemInput = jest.fn();
const mockValidateCreateFoodPortionInput = jest.fn();

// ===== repository mocks =====
const mockFetchSummaryData = jest.fn();
const mockInsertDiaryEntry = jest.fn();
const mockListDiaryEntriesRepository = jest.fn();
const mockFindDiaryEntryById = jest.fn();
const mockCreateDiaryEntryItemRepository = jest.fn();
const mockCheckDiaryEntryOwnership = jest.fn();
const mockCheckDiaryEntryItemOwnership = jest.fn();
const mockUpdateDiaryEntryItemRepository = jest.fn();
const mockDeleteDiaryEntry = jest.fn();
const mockDeleteDiaryEntryItem = jest.fn();
const mockGetDaysLogged = jest.fn();
const mockInsertFoodItem = jest.fn();
const mockInsertFoodPortion = jest.fn();
const mockFetchWeeklyCalorieTrend = jest.fn();
const mockCheckExistingFoodItemByExternalId = jest.fn();

// ===== external utils mocks =====
const mockSearchFoodById = jest.fn();
const mockParseFoodResponse = jest.fn();

// ===== mock validator module =====
jest.unstable_mockModule("../src/modules/diary/diary.validator.js", () => ({
  DiaryEntryError,
  validateCreateDiaryEntryInput: mockValidateCreateDiaryEntryInput,
  validateSummaryInput: mockValidateSummaryInput,
  validateListDisplay: mockValidateListDisplay,
  validateNewEntryDetails: mockValidateNewEntryDetails,
  validateUpdatedEntryItem: mockValidateUpdatedEntryItem,
  validateDeletedDiaryEntry: mockValidateDeletedDiaryEntry,
  validateEntryDetails: mockValidateEntryDetails,
  validateDeletedDiaryEntryItem: mockValidateDeletedDiaryEntryItem,
  validateUserIdForDashboard: mockValidateUserIdForDashboard,
  validateCreateFoodItemInput: mockValidateCreateFoodItemInput,
  validateCreateFoodPortionInput: mockValidateCreateFoodPortionInput,
}));

// ===== mock repository module =====
jest.unstable_mockModule("../src/modules/diary/diary.repository.js", () => ({
  fetchSummaryData: mockFetchSummaryData,
  insertDiaryEntry: mockInsertDiaryEntry,
  listDiaryEntries: mockListDiaryEntriesRepository,
  findDiaryEntryById: mockFindDiaryEntryById,
  createDiaryEntryItem: mockCreateDiaryEntryItemRepository,
  checkDiaryEntryOwnership: mockCheckDiaryEntryOwnership,
  checkDiaryEntryItemOwnership: mockCheckDiaryEntryItemOwnership,
  updateDiaryEntryItem: mockUpdateDiaryEntryItemRepository,
  deleteDiaryEntry: mockDeleteDiaryEntry,
  deleteDiaryEntryItem: mockDeleteDiaryEntryItem,
  getDaysLogged: mockGetDaysLogged,
  insertFoodItem: mockInsertFoodItem,
  insertFoodPortion: mockInsertFoodPortion,
  fetchWeeklyCalorieTrend: mockFetchWeeklyCalorieTrend,
  checkExistingFoodItemByExternalId: mockCheckExistingFoodItemByExternalId,
}));

// ===== mock searchFood util =====
jest.unstable_mockModule("../src/utils/searchFood.js", () => ({
  searchFoodById: mockSearchFoodById,
  parseFoodResponse: mockParseFoodResponse,
}));

const {
  updateDiaryEntryItem,
  deleteExistingDiaryEntry,
  deleteExistingDiaryEntryItem,
} = await import("../src/modules/diary/diary.service.js");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Diary Service", () => {
  describe("updateDiaryEntryItem", () => {
    test("returns updated item when valid", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 5,
        portionId: 1,
        quantity: 30,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true);
      mockUpdateDiaryEntryItemRepository.mockResolvedValue({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 1,
        quantity: 30,
      });

      await expect(
        updateDiaryEntryItem({
          userId: TEST_USERID,
          diaryEntryItemId: 5,
          portionId: 1,
          quantity: 30,
        })
      ).resolves.toEqual({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 1,
        quantity: 30,
      });
    });

    test("throws when item does not exist", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true);
      mockUpdateDiaryEntryItemRepository.mockResolvedValue(null);

      await expect(
        updateDiaryEntryItem({
          userId: TEST_USERID,
          diaryEntryItemId: 10,
        })
      ).rejects.toThrow("Diary entry item is not found");
    });
  });

  describe("deleteExistingDiaryEntry", () => {
    test("returns deleted entry when valid", async () => {
      mockValidateDeletedDiaryEntry.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: 5,
      });

      mockCheckDiaryEntryOwnership.mockResolvedValue(true);
      mockDeleteDiaryEntry.mockResolvedValue({
        diaryEntryId: TEST_ENTRYID,
      });

      await expect(
        deleteExistingDiaryEntry({
          userId: TEST_USERID,
          diaryEntryId: 5,
        })
      ).resolves.toEqual({
        diaryEntryId: TEST_ENTRYID,
      });
    });

    test("throws when entry does not exist", async () => {
      mockValidateDeletedDiaryEntry.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: 10,
      });

      mockCheckDiaryEntryOwnership.mockResolvedValue(true);
      mockDeleteDiaryEntry.mockResolvedValue(null);

      await expect(
        deleteExistingDiaryEntry({
          userId: TEST_USERID,
          diaryEntryId: 10,
        })
      ).rejects.toThrow("Diary entry is not found");
    });
  });

  describe("deleteExistingDiaryEntryItem", () => {
    test("returns deleted item when valid", async () => {
      mockValidateDeletedDiaryEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 5,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true);
      mockDeleteDiaryEntryItem.mockResolvedValue({
        diaryEntryItemId: TEST_ENTRYITEMID,
      });

      await expect(
        deleteExistingDiaryEntryItem({
          userId: TEST_USERID,
          diaryEntryItemId: 5,
        })
      ).resolves.toEqual({
        diaryEntryItemId: TEST_ENTRYITEMID,
      });
    });

    test("throws when item does not exist", async () => {
      mockValidateDeletedDiaryEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true);
      mockDeleteDiaryEntryItem.mockResolvedValue(null);

      await expect(
        deleteExistingDiaryEntryItem({
          userId: TEST_USERID,
          diaryEntryItemId: 10,
        })
      ).rejects.toThrow("Diary entry item is not found");
    });
  });
});