/**
 * Email utilities
 * Handles sending verification emails via Gmail API
 * @module utils/email
 */

import { google } from "googleapis";

/**
 * Gets a required environment variable or throws an error
 * @param {string} name - The environment variable name
 * @returns {string} The environment variable value
 * @throws {Error} If environment variable is not set
 */
function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

/**
 * Gets the sender email address from environment variables
 * @returns {string} The sender email address
 */
function getSenderEmail() {
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM;
  }

  return getRequiredEnv("GMAIL_USER");
}

/**
 * Creates and configures a Gmail API client
 * @returns {Object} Configured Gmail API client
 * @throws {Error} If required credentials are missing
 */
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

/**
 * Encodes an email message to base64url format for Gmail API
 * @param {string} message - The raw email message
 * @returns {string} Base64url encoded message
 */
function encodeEmail(message) {
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Creates a verification email message
 * @param {Object} params - Email parameters
 * @param {string} params.from - Sender email address
 * @param {string} params.to - Recipient email address
 * @param {string} params.code - 6-digit verification code
 * @returns {string} Encoded email message
 */
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

/**
 * Sends a verification email with a 6-digit code
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.code - 6-digit verification code
 * @returns {Promise<void>}
 * @throws {Error} If email sending fails
 */
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