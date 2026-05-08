import { expect } from "@jest/globals";
import { hashPassword, verifyPassword } from "../../src/utils/hash.js";

describe("hash utils", () => {
  test("hashPassword creates a hash and verifyPassword validates it", async () => {
    const password = "super-secret";
    const hash = await hashPassword(password);

    expect(typeof hash).toBe("string");
    expect(hash).not.toBe(password);

    await expect(verifyPassword(password, hash)).resolves.toBe(true);
    await expect(verifyPassword("some_wrong_password", hash)).resolves.toBe(false);
  });
});
