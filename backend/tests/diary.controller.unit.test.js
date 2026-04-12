// tests/diary.controller.unit.test.js
import { expect, jest } from "@jest/globals";

class mockDiaryEntryError extends Error {
  constructor(message) {
    super(message);
    this.name = "DiaryEntryError";
  }
}

// Mocks 

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
  });

  describe("getSummary", () => {
  });

  describe("listDiaryEntries", () => {
  });

  describe("getDiaryEntryById", () => {
  });

  describe("createDiaryEntryItem", () => {
  });

  describe("updateDiaryEntryItem", () => {
  });

  describe("deleteEntry", () => {
  });

  describe("deleteEntryItem", () => {
  });

  describe("getDashboard", () => {
  });
});
