// tests/diary.service.unit.test.js
import { expect, jest } from "@jest/globals";
import { validateDeletedDiaryEntry, validateDeletedDiaryEntryItem, validateUpdatedEntryItem } from "../src/modules/diary/diary.validator.js";
import { updateDiaryEntryItem as updateDiaryEntryItemRepository, deleteDiaryEntry, deleteDiaryEntryItem, checkDiaryEntryItemOwnership } from "../src/modules/diary/diary.repository.js";

// Mock the module(s) that the diary service depends on
const TEST_ID = 1;
const TEST_USERID = 2;
const TEST_ENTRYID = 3;
const TEST_ENTRYITEMID = 4;

const mockCheckDiaryEntryItemOwnership = jest.fn();
const mockValidateUpdatedEntryItem = jest.fn();
const mockUpdateDiaryEntryItem = jest.fn();
const mockValidateDeletedDiaryEntry = jest.fn();
const mockDeleteDiaryEntry = jest.fn();
const mockValidateDeletedDiaryEntryItem = jest.fn();
const mockDeleteDiaryEntryItem = jest.fn();

jest.unstable_mockModule("../src/modules/diary/diary.validator.js", () => ({
  validateUpdatedEntryItem: mockValidateUpdatedEntryItem,
  validateDeletedDiaryEntry: mockValidateDeletedDiaryEntry,
  validateDeletedDiaryEntryItem: mockValidateDeletedDiaryEntryItem,
}));

jest.unstable_mockModule("../src/modules/diary/diary.repository.js", () => ({
  checkDiaryEntryItemOwnership: mockCheckDiaryEntryItemOwnership,
  updateDiaryEntryItemRepository: mockUpdateDiaryEntryItem,
  deleteDiaryEntry: mockDeleteDiaryEntry,
  deleteDiaryEntryItem: mockDeleteDiaryEntryItem,
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

const { DiaryEntryError } = await import("../src/modules/diary/diary.validator.js");

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
      mockDeleteDiaryEntry.mockResolvedValue({
        diaryEntryId: TEST_ENTRYID,
      });

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
      mockDeleteDiaryEntryItem.mockResolvedValue({
        diaryEntryItemId: TEST_ENTRYITEMID,
      });

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
      mockValidateDeletedDiaryEntryItem.mockReturnValue({
        userId: TEST_USERID,
        diaryEntryItemId: 10,
      });

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
