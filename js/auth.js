const oauthApplicationId = '5201b81280434411f4f45034781257d6d4ff22124b7f60936d0d5efc114f25c0';
const WEBSITE_ENDPOINT = 'https://www.inaturalist.org/'
const redirect_uri = 'https://seanclifford.github.io/inat-prototype-site/oauth_redirect.html'

async function authRequest()
{
    const verifier = generateRandomString();
    storeVerifier(verifier);

    const challenge = await pkceChallengeFromVerifier(verifier);

    const redirect =`${WEBSITE_ENDPOINT}oauth/authorize?client_id=${oauthApplicationId}&code_challenge=${challenge}&code_challenge_method=S256&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code`;
    window.location.href = redirect;
}

function storePreAuthPage() {
    sessionStorage.setItem('pre_auth_location', window.location.href);
}

function redirectToPreAuthLocation() {
    const priorLocation = sessionStorage.getItem('pre_auth_location');
    window.location.href = priorLocation;
}

function storeVerifier(verifier) {
    localStorage.setItem('auth_verifier', verifier);
}

function getVerifier() {
    return localStorage.getItem('auth_verifier');
}

function clearVerifier() {
    localStorage.removeItem('auth_verifier');
}

function storeAccessToken(accessToken) {
    localStorage.setItem('auth_access_token', accessToken);
}

function getAccessToken() {
    return localStorage.getItem('auth_access_token');
}

async function performTokenRequest(auth_code) {

    const verifier = getVerifier();
    console.log('VERIFIER:' + verifier);
    const payload = {
        client_id: oauthApplicationId,
        code: auth_code,
        grant_type: "authorization_code",
        redirect_uri: redirect_uri,
        code_verifier: verifier
    }
    const postOptions = {
        method: 'POST',
        headers: {
            'User-Agent': USER_AGENT,
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(payload)
    };
    console.log(JSON.stringify(postOptions)) //Debugging - REMOVE ME
    const response = await Api.limiter(async () => {return await fetch(WEBSITE_ENDPOINT + 'oauth/token', postOptions);});
    
    if (!response.ok)
    {
        console.log('Failed during request to get the auth token');
    }
    else
    {
        const tokenResponse = await response.json();
        storeAccessToken(tokenResponse.access_token);
        //clearVerifier();
    }
}

async function getApiToken() {
    const accessToken = getAccessToken();

    if (!accessToken) {
        return null;
    }

    const getOptions = {
        method: 'GET',
        headers: {
            'User-Agent': USER_AGENT,
            'Authorization': `Bearer ${accessToken}`
        }
    };
    const response = await Api.limiter(async () => {return await fetch(WEBSITE_ENDPOINT + 'users/api_token', getOptions);});

    if (!response.ok)
    {
        console.log('Failed during request to get the api token');
    }
    else
    {
        const body = await response.json();
        return body.api_token;
    }
}


//Below this line is some code pulled from https://github.com/aaronpk/pkce-vanilla-js
/*
MIT License

Copyright (c) 2019 Aaron Parecki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
*/
//////////////////////////////////////////////////////////////////////
// PKCE HELPER FUNCTIONS

// Generate a secure random string using the browser crypto functions
function generateRandomString() {
    var array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

// Calculate the SHA256 hash of the input text. 
// Returns a promise that resolves to an ArrayBuffer
function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

// Base64-urlencodes the input string
function base64urlencode(str) {
    // Convert the ArrayBuffer to string using Uint8 array to conver to what btoa accepts.
    // btoa accepts chars only within ascii 0-255 and base64 encodes them.
    // Then convert the base64 encoded to base64url encoded
    //   (replace + with -, replace / with _, trim trailing =)
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Return the base64-urlencoded sha256 hash for the PKCE challenge
async function pkceChallengeFromVerifier(v) {
    hashed = await sha256(v);
    return base64urlencode(hashed);
}