import { expect, jest } from "@jest/globals";

const sendMock = jest.fn();

jest.unstable_mockModule("googleapis", () => ({
  google: {
    auth: {
      OAuth2: class {
        setCredentials() {}
      },
    },
    gmail: () => ({
      users: {
        messages: {
          send: sendMock,
        },
      },
    }),
  },
}));

describe("email utils", () => {
  beforeEach(() => {
    jest.resetModules();
    sendMock.mockReset();
    process.env.GOOGLE_CLIENT_ID = "id";
    process.env.GOOGLE_CLIENT_SECRET = "secret";
    process.env.GOOGLE_REFRESH_TOKEN = "token";
    process.env.GMAIL_USER = "noreply@example.com";
  });

  test("sendVerificationEmail sends using gmail client", async () => {
    sendMock.mockResolvedValue({});

    const { sendVerificationEmail } = await import("../../src/utils/email.js");

    await sendVerificationEmail({ to: "user@example.com", code: "123456" });

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].userId).toBe("me");
    expect(sendMock.mock.calls[0][0].requestBody.raw).toBeTruthy();
  });

  test("sendVerificationEmail wraps gmail failures", async () => {
    sendMock.mockRejectedValue(new Error("gmail down"));

    const { sendVerificationEmail } = await import("../../src/utils/email.js");

    await expect(sendVerificationEmail({ to: "user@example.com", code: "123456" }))
      .rejects
      .toThrow("Gmail email failed");
  });
});
