import { getApiToken } from "./auth.js";
import { Api } from "./api/api.js";

export async function getAuthenticatedUser() {
    const apiToken = await getApiToken();
    if (apiToken) {
        let authenticatedUser = await Api.getAuthenticatedUser(apiToken);

        if (authenticatedUser.status === 'ERROR') {
            console.error(authenticatedUser.message);
            authenticatedUser = null;
        }

        return authenticatedUser;
    } 
    return null;
}