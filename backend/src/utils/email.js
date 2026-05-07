import { google } from "googleapis";

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function getSenderEmail() {
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM;
  }

  return getRequiredEnv("GMAIL_USER");
}

function createGmailClient() {
  const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getRequiredEnv("GOOGLE_CLIENT_SECRET");
  const refreshToken = getRequiredEnv("GOOGLE_REFRESH_TOKEN");

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
}

function encodeEmail(message) {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function createVerificationEmail({ from, to, code }) {
  const subject = "Your verification code for GoodFood";

  const html = `
    <p>Your verification code is <strong>${code}</strong>.</p>
    <p>It expires in 10 minutes.</p>
  `;

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
  ].join("\n");

  return encodeEmail(message);
}

export async function sendVerificationEmail({ to, code }) {
  const from = getSenderEmail();
  const gmail = createGmailClient();

  const raw = createVerificationEmail({
    from,
    to,
    code,
  });

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw,
      },
    });
  } catch (error) {
    throw new Error("Gmail email failed");
  }
}