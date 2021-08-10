const OAUTH_APPLICATION_ID = '5201b81280434411f4f45034781257d6d4ff22124b7f60936d0d5efc114f25c0';
const REDIRECT_URI = 'https://seanclifford.github.io/inat-prototype-site/oauth_redirect.html'
let authenticatedUser = null;

async function authRequest()
{
    const verifier = generateRandomString();
    storeVerifier(verifier);

    const challenge = await pkceChallengeFromVerifier(verifier);

    const currentSite = await getCurrentSite();

    const redirect =`${currentSite.url}/oauth/authorize?client_id=${OAUTH_APPLICATION_ID}&code_challenge=${challenge}&code_challenge_method=S256&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    window.location.href = redirect;
}

function storePreAuthPage() {
    sessionStorage.setItem('pre_auth_location', window.location.href);
}

function redirectToPreAuthLocation() {
    const priorLocation = sessionStorage.getItem('pre_auth_location');
    window.location.replace(priorLocation);
}

function storeVerifier(verifier) {
    sessionStorage.setItem('auth_verifier', verifier);
}

function getVerifier() {
    return sessionStorage.getItem('auth_verifier');
}

function clearVerifier() {
    sessionStorage.removeItem('auth_verifier');
}

function storeAccessToken(accessToken) {
    sessionStorage.setItem('auth_access_token', accessToken);
}

function getAccessToken() {
    return sessionStorage.getItem('auth_access_token');
}

function clearAccessToken() {
    sessionStorage.removeItem('auth_access_token');
}

async function getApiToken() {
    let apiToken = sessionStorage.getItem('api_token');

    if (apiToken) {
        return apiToken;
    }

    return await requestApiToken();
}

function setApiToken(apiToken){
    sessionStorage.setItem('api_token', apiToken);
}

function clearApiToken() {
    sessionStorage.removeItem('api_token');
}

function clearAllAuthenticationState() {
    clearVerifier();
    clearAccessToken();
    clearApiToken();
}

async function performTokenRequest(auth_code) {

    const verifier = getVerifier();
    const payload = {
        client_id: OAUTH_APPLICATION_ID,
        code: auth_code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier
    }
    const currentSite = await getCurrentSite();
    const postOptions = Api.postFetchOptions(payload);
    const response = await Api.limiter(async () => {return await fetch(currentSite.url + '/oauth/token', postOptions);});
    
    if (!response.ok) {
        console.log('Failed during request to get the auth token');
    }
    else {
        const tokenResponse = await response.json();
        storeAccessToken(tokenResponse.access_token);
        clearVerifier();
    }
}

async function requestApiToken() {
    const accessToken = getAccessToken();

    if (!accessToken) {
        return null;
    }
    const currentSite = await getCurrentSite();
    const getOptions = Api.getAuthFetchOptions(`Bearer ${accessToken}`);
    const response = await Api.limiter(async () => {return await fetch(currentSite.url + '/users/api_token', getOptions);});

    if (!response.ok) {
        console.log('Failed during request to get the api token');
    }
    else {
        const body = await response.json();
        apiToken = body.api_token;
        setApiToken(apiToken);
        return apiToken;
    }
}

async function getAuthenticatedUser() {
    const apiToken = await getApiToken();
    if (apiToken) {
        authenticatedUser = await Api.getAuthenticatedUser(apiToken)

        if (authenticatedUser.status === 'ERROR') {
            setError(authenticatedUser.message);
            authenticatedUser = null;
        }

        return authenticatedUser;
    } 
    return null;
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

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
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