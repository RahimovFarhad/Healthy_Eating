// tests/diary.service.unit.test.js
<<<<<<< HEAD
import { expect, jest } from "@jest/globals";
import { DiaryEntryError } from "../src/modules/diary/diary.validator.js";

// Mock the module(s) that the diary service depends on
const TEST_ID = 1;
=======
import { describe, test, expect, jest, beforeEach } from "@jest/globals";

// ===== test constants =====
>>>>>>> auth_and_schema
const TEST_USERID = 2;
const TEST_ENTRYID = 3;
const TEST_ENTRYITEMID = 4;

<<<<<<< HEAD
const mockCheckDiaryEntryItemOwnership = jest.fn();
const mockValidateUpdatedEntryItem = jest.fn();
const mockUpdateDiaryEntryItem = jest.fn();
const mockValidateDeletedDiaryEntry = jest.fn();
const mockDeleteDiaryEntry = jest.fn();
const mockValidateDeletedDiaryEntryItem = jest.fn();
const mockDeleteDiaryEntryItem = jest.fn();
const mockValidateCreateDiaryEntryInput = jest.fn();
const mockValidateSummaryInput = jest.fn();
const mockValidateListDisplay = jest.fn();
const mockValidateNewEntryDetails = jest.fn();
const mockValidateEntryDetails = jest.fn();
const mockValidateUserIdForDashboard = jest.fn();
const mockValidateCreateFoodItemInput = jest.fn();
const mockValidateCreateFoodPortionInput = jest.fn();

const mockFetchSummaryData = jest.fn();
const mockInsertDiaryEntry = jest.fn();
const mockListDiaryEntries = jest.fn();
const mockFindDiaryEntryById = jest.fn();
const mockCreateDiaryEntryItem = jest.fn();
const mockCheckDiaryEntryOwnership = jest.fn();
const mockGetDaysLogged = jest.fn();
const mockInsertFoodItem = jest.fn();
const mockInsertFoodPortion = jest.fn();
const mockFetchWeeklyCalorieTrend = jest.fn();
const mockCheckExistingFoodItemByExternalId = jest.fn();

jest.unstable_mockModule("../src/modules/diary/diary.validator.js", () => ({
  DiaryEntryError: DiaryEntryError,
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

jest.unstable_mockModule("../src/modules/diary/diary.repository.js", () => ({
  fetchSummaryData: mockFetchSummaryData,
  insertDiaryEntry: mockInsertDiaryEntry,
  listDiaryEntries: mockListDiaryEntries,
  findDiaryEntryById: mockFindDiaryEntryById,
  createDiaryEntryItem: mockCreateDiaryEntryItem,
  checkDiaryEntryOwnership: mockCheckDiaryEntryOwnership,
  checkDiaryEntryItemOwnership: mockCheckDiaryEntryItemOwnership,
  updateDiaryEntryItem: mockUpdateDiaryEntryItem,
  deleteDiaryEntry: mockDeleteDiaryEntry,
  deleteDiaryEntryItem: mockDeleteDiaryEntryItem,
  getDaysLogged: mockGetDaysLogged,
  insertFoodItem: mockInsertFoodItem,
  insertFoodPortion: mockInsertFoodPortion,
  fetchWeeklyCalorieTrend: mockFetchWeeklyCalorieTrend,
  checkExistingFoodItemByExternalId: mockCheckExistingFoodItemByExternalId,
}));

const {
  createDiaryEntry,
  getNutritionSummary,
  listDiaryEntries,
  getDiaryEntryById,
  createDiaryEntryItem,
  updateDiaryEntryItem,
  deleteExistingDiaryEntry,
  deleteExistingDiaryEntryItem,
  getDashboardDataForSubscriber,
} = await import("../src/modules/diary/diary.service.js");

describe("Diary Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createDiaryEntry (unit)", () => {
  });

  describe("getNutritionSummary (unit)", () => {
  });

  describe("listDiaryEntries (unit)", () => {
  });

  describe("getDiaryEntryById (unit)", () => {
  });

  describe("createDiaryEntryItem (unit)", () => {
  });

  describe("updateDiaryEntryItem (unit)", () => {
    test("returns updated diary entry item when inputs are valid and diary entry item exists", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: undefined,
        quantity: undefined,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      // calls from diary repo. mock function
      mockUpdateDiaryEntryItem.mockResolvedValue({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: undefined,
        quantity: undefined,
      });

      // calls from the diary.service function
      const result = await updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
      });

      expect(result).toEqual({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: undefined,
        quantity: undefined,
      });
    });
    test("returns updated diary entry item when diary entry item exists, portionId was provided and all inputs are valid", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: 1,
        quantity: undefined,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockUpdateDiaryEntryItem.mockResolvedValue({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 1,
        quantity: undefined,
      });

      const result = await updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: 1,
      });

      expect(result).toEqual({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 1,
        quantity: undefined,
      });
    });
    test("returns updated diary entry item when diary entry item exists, quantity was provided and all inputs are valid", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: undefined,
        quantity: 30,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockUpdateDiaryEntryItem.mockResolvedValue({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: undefined,
        quantity: 30,
      });

      const result = await updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        quantity: 30,
      });

      expect(result).toEqual({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: undefined,
        quantity: 30,
      });
    });
    test("returns updated diary entry item when diary entry item exists, portionId and quantity was provided and all inputs are valid", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: 1,
        quantity: 30,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockUpdateDiaryEntryItem.mockResolvedValue({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 1,
        quantity: 30,
      });

      const result = await updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: 1,
        quantity: 30,
      });

      expect(result).toEqual({
        id: TEST_ENTRYITEMID,
        diaryEntryId: TEST_ENTRYID,
        portionId: 1,
        quantity: 30,
      });
    });
    test("throws DiaryEntryError when userId is missing or invalid", async () => {
      mockValidateUpdatedEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("User ID is required");
      });

      await expect(updateDiaryEntryItem({
        userId: null,
        diaryEntryItemId: TEST_ENTRYITEMID,
      })).rejects.toEqual(expect.objectContaining({
          message: "User ID is required"
      }));
    }); // test case covers both missing or invalid (i.e., invalid => userId might be entered as a string), which raises a DiaryEntryError. invalid counts under as missing userId
    test("throws DiaryEntryError when diaryEntryItemId is missing or invalid", async () => {
      mockValidateUpdatedEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("Diary Entry ID is required");
      });

      await expect(updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: null 
      })).rejects.toEqual(expect.objectContaining({
          message: "Diary Entry ID is required"
      }));
    }); // same logic as userId, but for diaryEntryItemId
    test("throws DiaryEntryError when portionId was provided, but value is invalid", async () => {
      mockValidateUpdatedEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("Portion ID is required");
      });

      await expect(updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        portionId: -1 
      })).rejects.toEqual(expect.objectContaining({
          message: "Portion ID is required"
      }));
    });
    test("throws DiaryEntryError when quantity was provided, but value is invalid", async () => {
      mockValidateUpdatedEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("Quantity is required and must be a positive number");
      });

      await expect(updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
        quantity: -30, 
      })).rejects.toEqual(expect.objectContaining({
          message: "Quantity is required and must be a positive number"
      }));
    });
    test("throws DiaryEntryError when diary entry item does not belong to the user", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 5,
        portionId: undefined,
        quantity: undefined,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(false); // set to false, indicating that diary entry item does not belong to user

      await expect(updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: 5,
        portionId: undefined,
        quantity: undefined,
      })).rejects.toEqual(expect.objectContaining({
        message: "Unauthorised access"
      }));
    });
    test("throws DiaryEntryError when diary entry item does not exist", async () => {
      mockValidateUpdatedEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
        portionId: undefined,
        quantity: undefined,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockUpdateDiaryEntryItem.mockResolvedValue(null); // null value due to P2025 error

      await expect(updateDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
        portionId: undefined,
        quantity: undefined,
      })).rejects.toEqual(expect.objectContaining({
        message: "Diary entry item is not found"
      }));
    });
  });

  describe("deleteExistingDiaryEntry (unit)", () => {
    test("returns deleted diary error object when inputs are valid and diary entry exists", async () => {
      mockValidateDeletedDiaryEntry.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
      });

      mockCheckDiaryEntryOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
=======
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
>>>>>>> auth_and_schema
      mockDeleteDiaryEntry.mockResolvedValue({
        diaryEntryId: TEST_ENTRYID,
      });

<<<<<<< HEAD
      const result = await deleteExistingDiaryEntry({
        userId: TEST_USERID,
        diaryEntryId: TEST_ENTRYID,
      });

      expect(result).toEqual({
        diaryEntryId: TEST_ENTRYID,
      });
    });
    test("throws DiaryEntryError when userId is missing or invalid", async () => {
      mockValidateDeletedDiaryEntry.mockImplementation(() => {
        throw new DiaryEntryError("User ID is required");
      });

      await expect(deleteExistingDiaryEntry({
        userId: null,
        diaryEntryId: TEST_ENTRYID,
      })).rejects.toEqual(expect.objectContaining({
          message: "User ID is required"
      }));
    });
    test("throws DiaryEntryError when diaryEntryId is missing or invalid", async () => {
      mockValidateDeletedDiaryEntry.mockImplementation(() => {
        throw new DiaryEntryError("Diary Entry ID is required");
      });

      await expect(deleteExistingDiaryEntry({
        userId: TEST_USERID,
        diaryEntryId: null 
      })).rejects.toEqual(expect.objectContaining({
          message: "Diary Entry ID is required"
      }));
    });
    test("throws DiaryEntryError when diary entry does not belong to the user", async () => {
      // validate entries
      mockValidateDeletedDiaryEntry.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: 5,
      });

      mockCheckDiaryEntryOwnership.mockResolvedValue(false); // set to false, indicating that diary entry item does not belong to user

      await expect(deleteExistingDiaryEntry({
        userId: TEST_USERID,
        diaryEntryId: 5,
      })).rejects.toEqual(expect.objectContaining({
        message: "Unauthorised access"
      }));
    });
    test("throws DiaryEntryError when diary entry does not exist", async () => {
      mockValidateDeletedDiaryEntry.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryId: 10, // using 10 as diaryEntryId not existing
      });

      mockCheckDiaryEntryOwnership.mockResolvedValue(true);
      mockDeleteDiaryEntry.mockResolvedValue(null); // null value due to P2025 error

      await expect(deleteExistingDiaryEntry({
        userId: TEST_USERID,
        diaryEntryId: 10,
      })).rejects.toEqual(expect.objectContaining({
        message: "Diary entry is not found"
      }));
    });
  });

  describe("deleteExistingDiaryEntryItem (unit)", () => {
    test("deletes an existing diary entry item when inputs are valid and diary entry item exists", async () => {
      mockValidateDeletedDiaryEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
=======
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
>>>>>>> auth_and_schema
      mockDeleteDiaryEntryItem.mockResolvedValue({
        diaryEntryItemId: TEST_ENTRYITEMID,
      });

<<<<<<< HEAD
      const result = await deleteExistingDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: TEST_ENTRYITEMID,
      });

      expect(result).toEqual({
        diaryEntryItemId: TEST_ENTRYITEMID,
      });
    });
    test("throws DiaryEntryError when userId is missing or invalid", async () => {
      mockValidateDeletedDiaryEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("User ID is required");
      });

      await expect(deleteExistingDiaryEntryItem({
        userId: null,
        diaryEntryItemId: TEST_ENTRYITEMID
      })).rejects.toEqual(expect.objectContaining({
          message: "User ID is required"
      }));
    });
    test("throws DiaryEntryError when diaryEntryId is missing or invalid", async () => {
      mockValidateDeletedDiaryEntryItem.mockImplementation(() => {
        throw new DiaryEntryError("Diary Entry Item ID is required");
      });

      await expect(deleteExistingDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: null 
      })).rejects.toEqual(expect.objectContaining({
          message: "Diary Entry Item ID is required"
      }));
    });
    test("throws DiaryEntryError when diary entry item does not belong to the user", async () => {
      mockValidateDeletedDiaryEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 5,
      });

      mockCheckDiaryEntryItemOwnership.mockResolvedValue(false); // set to false, indicating that diary entry item does not belong to user

      await expect(deleteExistingDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: 5,
      })).rejects.toEqual(expect.objectContaining({
        message: "Unauthorised access"
      }));
    });
    test("throws DiaryEntryError when diary entry item does not exist", async () => {
=======
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
>>>>>>> auth_and_schema
      mockValidateDeletedDiaryEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
      });

<<<<<<< HEAD
      mockCheckDiaryEntryItemOwnership.mockResolvedValue(true); // set to true, indicating that diary entry item does belong to user
      mockDeleteDiaryEntryItem.mockResolvedValue(null); // null value due to P2025 error

      await expect(deleteExistingDiaryEntryItem({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
      })).rejects.toEqual(expect.objectContaining({
        message: "Diary entry item is not found"
      }));
    });
  });

  describe("getDashboardDataForSubscriber (unit)", () => {
  });
});
=======
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
>>>>>>> auth_and_schema
