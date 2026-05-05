import axios from "axios";

const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET must be set in the environment");
}

let cachedToken = null;
let tokenExpiry = null;
let refreshPromise = null;

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

async function refreshToken() {
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
}
            
export { getToken };