require('dotenv').config();
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

app.get("/patreon-oauth", (req, res) => {
    const oauthGrantCode = url.parse(req.url, true).query.code;

    console.log(oauthGrantCode);
    patreonOAuthClient
        .getTokens(oauthGrantCode, REDIRECT_URL)
        .then(tokensResponse => {
            accessToken = tokensResponse.access_token; // Store the access token
            const patreonAPIClient = patreonAPI(accessToken);
            return patreonAPIClient('/current_user');
        })
        .then(result => {
          console.log("2");
            const store = result.store;
            res.json(store.findAll('user').map(user => user.serialize()));
        })
        .catch(err => {
            console.error('error!', err);
            res.status(500).send(err);
        });
});

app.get("/get-access-token", (req, res) => {
  console.log("1");
    if (accessToken) {
        res.json({ accessToken });
    } else {
        res.status(404).send('No access token found');
    }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
