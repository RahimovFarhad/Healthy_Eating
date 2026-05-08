/**
 * FatSecret API token manager
 * Manages OAuth token retrieval and caching for FatSecret API
 * @module utils/apiTokenManager
 */

import axios from "axios";

const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET must be set in the environment");
}

let cachedToken = null;
let tokenExpiry = null;
let refreshPromise = null;

/**
 * Gets a valid FatSecret API access token
 * Returns cached token if valid, otherwise refreshes it
 * Prevents concurrent refresh requests
 * @returns {Promise<string>} Valid access token
 */
async function getToken() {
    if (!cachedToken || Date.now() > tokenExpiry) {
        if (!refreshPromise) { // when 2 requests will arrive at the same time, only 1 of them will try to refresh the token  
            refreshPromise = refreshToken().finally(() => {
                refreshPromise = null;
            });
        }
        await refreshPromise;
    }
    return cachedToken;
}

/**
 * Refreshes the FatSecret API access token
 * Updates cached token and expiry time
 * Retries up to 3 times on failure with exponential backoff
 * @returns {Promise<void>}
 * @throws {Error} If token refresh fails after all retries
 */
async function refreshToken() {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.post(
                "https://oauth.fatsecret.com/connect/token",
                new URLSearchParams({
                    grant_type: "client_credentials",
                    scope: "basic"
                }),
                {
                    auth: {
                        username: CLIENT_ID,
                        password: CLIENT_SECRET
                    },
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            );

            cachedToken = response.data.access_token;
            tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            return;
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                // Exponential backoff: 1s, 2s, 4s
                const delay = Math.pow(2, attempt - 1) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}
            
export { getToken };