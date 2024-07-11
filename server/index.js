require('dotenv').config();
const express = require("express");
const url = require('url');
const patreon = require('patreon');
const patreonAPI = patreon.patreon;
const patreonOAuth = patreon.oauth;
const cors = require('cors');

const CLIENT_ID = process.env.CLIENT_ID || 'KRiq_33aFb4Bltv-NydVH5KeWNTMzFS-05fesEZ-AguxO-EBuZLfmEvG-c5T1voJ';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'Jw0mb7LxkLScY-fwlksVekR-REcjGeFh1t8pSf-d4xNKiKUOvxY6kumxAiif4xOd';
const REDIRECT_URL = process.env.REDIRECT_URL || 'https://apiegames.com/patreon-api';

const patreonOAuthClient = patreonOAuth(CLIENT_ID, CLIENT_SECRET);
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("/patreon-oauth", (req, res) => {
    const oauthGrantCode = url.parse(req.url, true).query.code;

    patreonOAuthClient
        .getTokens(oauthGrantCode, REDIRECT_URL)
        .then(tokensResponse => {
            res.json(tokensResponse);
        })
        .catch(err => {
            console.error('error!', err);
            res.status(500).send(err);
        });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
