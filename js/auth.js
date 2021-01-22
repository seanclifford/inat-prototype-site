const oauthApplicationId = '5201b81280434411f4f45034781257d6d4ff22124b7f60936d0d5efc114f25c0';
const WEBSITE_ENDPOINT = 'https://www.inaturalist.nz/'

function authRequest()
{
    getPkce(43, (error, { verifier, challenge }) => {
            if (!error) {
                storeVerifier(verifier);
                const redirect =`${WEBSITE_ENDPOINT}oauth/authorize?client_id=${oauthApplicationId}&code_challenge=${challenge}&code_challenge_method=S256&redirect_uri=https%3A%2F%2Fseanclifford.github.io%2Finat-prototype-site%2Foauth_redirect.html&response_type=code`;
                console.log(redirect);
                alert(redirect);
                //window.location.href = redirect;
            }
      });
}

function storePreAuthPage() {
    sessionStorage.setItem('pre_auth_location', window.location.href);
}

function redirectToPreAuthLocation() {
    const priorLocation = sessionStorage.getItem('pre_auth_location');
    window.location.href = priorLocation;
}

function storeVerifier(verifier) {
    sessionStorage.setItem('auth_verifier', verifier);
}

function getVerifier() {
    sessionStorage.getItem('auth_verifier');
}

function storeAccessToken() {
    sessionStorage.setItem('auth_access_token', verifier);
}

function getAccessToken() {
    sessionStorage.getItem('auth_access_token');
}

async function performTokenRequest(auth_code) {

    const payload = {
        client_id: oauthApplicationId,
        code: auth_code,
        grant_type: "authorization_code",
        code_verifier: getVerifier()
    }
    const postOptions = {
        method: 'POST',
        headers: {
            'User-Agent': USER_AGENT,
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(payload)
    };
    const response = await fetch(WEBSITE_ENDPOINT + 'oauth/token', postOptions);
    
    if (!response.ok)
    {
        console.log('Failed during request to get the auth token');
    }
    else
    {
        const tokenResponse = await response.json();
        storeAccessToken(tokenResponse.access_token);
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
    const response = await fetch(WEBSITE_ENDPOINT + 'users/api_token', getOptions);

    if (!response.ok)
    {
        console.log('Failed during request to get the api token');
    }
    else
    {
        return response.api_token;
    }
}
