require('dotenv').config();
const express = require('express');
const axios = require('axios');
const axiosRetry = require('axios-retry');

const PORT = process.env.PORT || 3001;
const app = express();

const PATREON_CLIENT_ID = process.env.PATREON_CLIENT_ID;
const PATREON_CLIENT_SECRET = process.env.PATREON_CLIENT_SECRET;
const PATREON_REDIRECT_URI = process.env.PATREON_REDIRECT_URI;

// Configure axios to use axios-retry
axiosRetry(axios, { retries: 3, retryDelay: (retryCount) => {
    console.log(`Retry attempt: ${retryCount}`);
    return retryCount * 2000; // time interval between retries
}});

app.get('/api', (req, res) => {
    res.json({ message: 'Hello from server!' });
});

// Redirect users to Patreon for authorization
app.get('/auth/patreon', (req, res) => {
    const authUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${PATREON_CLIENT_ID}&redirect_uri=${encodeURIComponent(PATREON_REDIRECT_URI)}`;
    res.redirect(authUrl);
});

// Handle the OAuth callback from Patreon
app.get('/patreon-api', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        console.error('Code is missing');
        return res.status(400).send('Code is missing');
    }

    try {
        console.log(`Requesting token with code: ${code}`);
        const tokenResponse = await axios.post('https://www.patreon.com/api/oauth2/token', null, {
            params: {
                code,
                grant_type: 'authorization_code',
                client_id: PATREON_CLIENT_ID,
                client_secret: PATREON_CLIENT_SECRET,
                redirect_uri: PATREON_REDIRECT_URI,
            },
        });

        const accessToken = tokenResponse.data.access_token;
        const refreshToken = tokenResponse.data.refresh_token;

        console.log(`Access token: ${accessToken}`);
        console.log(`Refresh token: ${refreshToken}`);

        // Use the access token to fetch user data or other actions
        const userResponse = await axios.get('https://www.patreon.com/api/oauth2/v2/identity', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        console.log('User data retrieved successfully');
        res.json(userResponse.data);
    } catch (error) {
        console.error('Error fetching access token', error.response ? error.response.data : error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
//