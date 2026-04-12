import axios from "axios";

// Needs to be kept in .env file, so I will reset those values after the test.

const CLIENT_ID = "076a443326144c08b59af2bb20c7aee8" 
const CLIENT_SECRET = "b59e9d423497469584f0dd4648014c18"

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