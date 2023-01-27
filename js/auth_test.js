import { getAuthenticatedUser } from "./user.js"
import { clearAllAuthenticationState, ensureAuthenticated } from "./auth.js"

globalThis.ensureAuthenticated = ensureAuthenticated;
globalThis.logout = logout;

(async () => {
    await populateAuthenticatedUser();
})();

async function populateAuthenticatedUser() {
    const user = await getAuthenticatedUser();
    
    const authUserDiv = document.getElementById('authenticated_user');
    const noUser = document.getElementById('no_user');

    if (user) {
        const authUserInfo = document.getElementById('user_info');

        authUserInfo.setAttribute('img', user.icon);
        authUserInfo.setAttribute('login', user.login);
        authUserInfo.setAttribute('name', user.name);
        
        authUserDiv.style.display = '';
        noUser.style.display = 'none';
    }
    else {
        authUserDiv.style.display = 'none';
        noUser.style.display = '';
    }
}

async function logout() {
    clearAllAuthenticationState();
    await populateAuthenticatedUser();
}