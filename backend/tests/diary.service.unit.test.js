// tests/diary.service.unit.test.js
import { describe, test, expect, jest, beforeEach } from "@jest/globals";

// ===== test constants =====
const TEST_USERID = 2;
const TEST_ENTRYID = 3;
const TEST_ENTRYITEMID = 4;

// ===== validator mocks =====
const mockValidateCreateDiaryEntryInput = jest.fn();
const mockValidateSummaryInput = jest.fn();
const mockValidateListDisplay = jest.fn();
const mockValidateEntryDetails = jest.fn();
const mockValidateNewEntryDetails = jest.fn();
const mockValidateUpdatedEntryItem = jest.fn();
const mockValidateDeletedDiaryEntry = jest.fn();
const mockValidateDeletedDiaryEntryItem = jest.fn();
const mockValidateUserIdForDashboard = jest.fn();

// ===== repository mocks =====
const mockInsertDiaryEntry = jest.fn();
const mockFetchSummaryData = jest.fn();
const mockListDiaryEntriesRepo = jest.fn();
const mockFindDiaryEntryById = jest.fn();
const mockCreateDiaryEntryItem = jest.fn();
const mockUpdateDiaryEntryItemRepo = jest.fn();
const mockDeleteDiaryEntry = jest.fn();
const mockDeleteDiaryEntryItem = jest.fn();
const mockCheckDiaryEntryItemOwnership = jest.fn();
const mockCheckDiaryEntryOwnership = jest.fn();

// ===== mock validator module =====
jest.unstable_mockModule("../src/modules/diary/diary.validator.js", () => ({
  validateCreateDiaryEntryInput: mockValidateCreateDiaryEntryInput,
  validateSummaryInput: mockValidateSummaryInput,
  validateListDisplay: mockValidateListDisplay,
  validateEntryDetails: mockValidateEntryDetails,
  validateNewEntryDetails: mockValidateNewEntryDetails,
  validateUpdatedEntryItem: mockValidateUpdatedEntryItem,
  validateDeletedDiaryEntry: mockValidateDeletedDiaryEntry,
  validateDeletedDiaryEntryItem: mockValidateDeletedDiaryEntryItem,
  validateUserIdForDashboard: mockValidateUserIdForDashboard,
}));

// ===== mock repository module =====
jest.unstable_mockModule("../src/modules/diary/diary.repository.js", () => ({
  insertDiaryEntry: mockInsertDiaryEntry,
  fetchSummaryData: mockFetchSummaryData,
  listDiaryEntries: mockListDiaryEntriesRepo,
  findDiaryEntryById: mockFindDiaryEntryById,
  createDiaryEntryItem: mockCreateDiaryEntryItem,
  updateDiaryEntryItem: mockUpdateDiaryEntryItemRepo,
  deleteDiaryEntry: mockDeleteDiaryEntry,
  deleteDiaryEntryItem: mockDeleteDiaryEntryItem,
  checkDiaryEntryItemOwnership: mockCheckDiaryEntryItemOwnership,
  checkDiaryEntryOwnership: mockCheckDiaryEntryOwnership,
}));

// ===== import service after mocks =====
const {
  updateDiaryEntryItem,
  deleteExistingDiaryEntry,
  deleteExistingDiaryEntryItem,
  createDiaryEntry,
  listDiaryEntries,
  getDiaryEntryById,
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
      mockUpdateDiaryEntryItemRepo.mockResolvedValue({
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

    test("returns null when item does not exist", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true);
      mockUpdateDiaryEntryItemRepo.mockResolvedValue(null);

      await expect(
        updateDiaryEntryItem({
          userId: TEST_USERID,
          diaryEntryItemId: 10,
        })
      ).resolves.toBeNull();
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

    test("returns null when entry does not exist", async () => {
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
      ).resolves.toBeNull();
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

    test("returns null when item does not exist", async () => {
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
      ).resolves.toBeNull();
    });
  });
});

// ===== Additional tests by Dingchen: create/get/list service tests =====
describe("Additional tests by Dingchen - Service", () => {

  describe("createDiaryEntry", () => {
    test("should create entry when input is valid", async () => {
      mockValidateCreateDiaryEntryInput.mockReturnValue(true);

      mockInsertDiaryEntry.mockResolvedValue({
        diaryEntryId: TEST_ENTRYID
      });

      const result = await createDiaryEntry({
        userId: TEST_USERID,
        data: { food: "apple" }
      });

      expect(mockValidateCreateDiaryEntryInput).toHaveBeenCalled();
      expect(mockInsertDiaryEntry).toHaveBeenCalled();
      expect(result).toEqual({ diaryEntryId: TEST_ENTRYID });
    });
  });

  describe("listDiaryEntries", () => {
    test("should return list of entries", async () => {
      mockValidateListDisplay.mockReturnValue(true);

      mockListDiaryEntriesRepo.mockResolvedValue([
        { diaryEntryId: 1 },
        { diaryEntryId: 2 }
      ]);

      const result = await listDiaryEntries({
        userId: TEST_USERID
      });

      expect(mockValidateListDisplay).toHaveBeenCalled();
      expect(mockListDiaryEntriesRepo).toHaveBeenCalled();
      expect(result.length).toBe(2);
    });
  });

  describe("getDiaryEntryById", () => {
    test("should return entry when it exists", async () => {
      mockValidateEntryDetails.mockReturnValue(true);

      mockFindDiaryEntryById.mockResolvedValue({
        diaryEntryId: TEST_ENTRYID
      });

      const result = await getDiaryEntryById({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID
      });

      expect(mockValidateEntryDetails).toHaveBeenCalled();
      expect(mockFindDiaryEntryById).toHaveBeenCalled();
      expect(result).toEqual({ diaryEntryId: TEST_ENTRYID });
    });
  });

});