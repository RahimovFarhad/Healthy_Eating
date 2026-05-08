import { expect, jest } from "@jest/globals";

const mockPost = jest.fn();

jest.unstable_mockModule("axios", () => ({
  default: {
    post: mockPost,
  },
}));

describe("apiTokenManager", () => {
  beforeEach(() => {
    jest.resetModules();
    mockPost.mockReset();
    process.env.FATSECRET_CLIENT_ID = "client";
    process.env.FATSECRET_CLIENT_SECRET = "secret";
  });

  test("getToken fetches correctky", async () => {
    mockPost.mockResolvedValue({
      data: {
        access_token: "abc123",
        expires_in: 3600,
      },
    });

    const { getToken } = await import("../../src/utils/apiTokenManager.js");

    const t1 = await getToken();

    expect(t1).toBe("abc123");

    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
