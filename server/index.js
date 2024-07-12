require('dotenv').config();
import { patreon as patreonAPI } from 'patreon'

const express = require("express");
const url = require('url');
const patreon = require('patreon');
const patreonAPI = patreon.patreon;
const patreonOAuth = patreon.oauth;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

const patreonOAuthClient = patreonOAuth(CLIENT_ID, CLIENT_SECRET);
const PORT = process.env.PORT || 3001;

const app = express();
let accessToken = '';

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
  console.log('api');
});

app.get("/patreon-oauth", async (req, res) => {
    try {
        const oauthGrantCode = url.parse(req.url, true).query.code;
        if (!oauthGrantCode) {
            return res.status(400).send('Missing OAuth grant code');
        }

        console.log('OAuth Grant Code:', oauthGrantCode);
        console.log('Client ID:', CLIENT_ID);
        console.log('Client Secret:', CLIENT_SECRET);
        console.log('Redirect URL:', REDIRECT_URL);

        const tokensResponse = await patreonOAuthClient.getTokens(oauthGrantCode, REDIRECT_URL);
        console.log('Tokens Response:', tokensResponse);

        accessToken = tokensResponse.access_token; // Store the access token
        const patreonAPIClient = patreonAPI(accessToken);
        const result = await patreonAPIClient('/current_user');
        
        const store = result.store;
        res.json(store.findAll('user').map(user => user.serialize()));
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
        res.status(500).send('Internal Server Error');
    }
});


app.get("/get-access-token", (req, res) => {
    console.log("Checking access token");
    if (accessToken) {
        res.json({ accessToken });
    } else {
        res.status(404).send('No access token found');
    }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
