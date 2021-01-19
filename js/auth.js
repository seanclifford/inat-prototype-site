const oauthApplicationId = '5201b81280434411f4f45034781257d6d4ff22124b7f60936d0d5efc114f25c0';


function authRequest()
{
    getPkce(43, (error, { verifier, challenge }) => {
            if (!error) {
                storeVerifier(verifier);
                window.location.href =`https://www.inaturalist.nz/oauth/authorize?client_id=${oauthApplicationId}&code_challenge=${challenge}&code_challenge_method=S256&redirect_uri=https%3A%2F%2Fseanclifford.github.io%2Finat-prototype-site%2Foauth_redirect.html&response_type=code`;
            }
      });
}

function storeVerifier(verifier) {
    //TODO: store verifier in a cookie, or in session store?
}

function getVerifier() {
    //TODO: retrieve value from cookie or session store?
}

function storeAccessToken() {
    //TODO: store verifier in a cookie, or in session store?
}

function getAccessToken() {
    //TODO: retrieve value from cookie or session store?
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
            'User-Agent': 'agoranomos - INat Prototypes',
            'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(payload)
    };
    const response = await fetch(API_ENDPOINT + 'auth/token', postOptions);
    
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
