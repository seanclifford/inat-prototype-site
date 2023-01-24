import { getFetchOptions, getAuthFetchOptions, postAuthFetchOptions } from "./fetch-options.js";
import { limit } from "./api-limiter.js";

//const API_ENDPOINT = 'http://localhost:4000/v1/';
const API_ENDPOINT = 'https://api.inaturalist.org/v1/';

export const Api = {
    getUser: async function(userId) {
        
        let response = await limit(async () => { return await fetch(API_ENDPOINT + 'users/' + userId, getFetchOptions());});
        if (!response.ok) {
            return {
                status: 'ERROR',
                message: `Could not find user '${userId}'`
            }
        }
        else {
            let body = await response.json();
            return body.results[0];
        }
    },
    getProjectMembers: async function(projectId, page) {
        let response = await limit(async () => { return await fetch(`${API_ENDPOINT}projects/${projectId}/members?page=${page}&per_page=100&order_by=login`, getFetchOptions());});
        if (!response.ok) {
            return {
                status: 'ERROR',
                message: `Could not load project members for project '${projectId}'`
            }
        }
        else {
            let body = await response.json();
            return body;
        }
    },
    getObservations: async function(observationIds) {
        if (!observationIds) {
            return {
                status: 'ERROR',
                message: 'No observation ids entered.'
            }
        }
        let response = await limit(async () => { return await fetch(API_ENDPOINT + 'observations/' + observationIds, getFetchOptions());});
        if (!response.ok) {
            return {
                status: 'ERROR',
                message: `Could not load observations '${observationIds}'`
            }
        }
        else {
            let body = await response.json();
            return body.results;
        }
    },
    getSites: async function() {
        let response = await limit(async () => { return await fetch(API_ENDPOINT + 'sites/', getFetchOptions());});
        if (!response.ok) {
            return {
                status: 'ERROR',
                message: 'Could not load sites'
            }
        }
        else {
            let body = await response.json();
            return body.results;
        }
    },
    sendMessage: async function(toUser, subject, message, authToken) {
        //replace logic with comment to test without sending messages.
        //await limit(async () => {await delay(500);});
        //return { status: 'OK' };
        
        let bodyObj = {
            "message": {
                "to_user_id": toUser.id,
                "subject": subject,
                "body": message
            }
        };
        let response = await limit(async () => { return await fetch(API_ENDPOINT + 'messages', postAuthFetchOptions(bodyObj, authToken));});
        if (response.ok) {
            return {status: 'OK'}
        }
        else {
            let body = await response.json();
            errorMessage = body?.error?.original?.errors?.base[0];
            errorMessage = errorMessage ?? body?.error?.original?.error;
            return {
                
                status: 'ERROR',
                message: `Could not send message to user '${toUser.login}'. ${errorMessage??''}`
            }
        }
    },
    getAuthenticatedUser: async function(authToken) {
        let response = await limit(async () => { return await fetch(API_ENDPOINT + 'users/me', getAuthFetchOptions(authToken));});
        if (!response.ok) {
            return {
                status: 'ERROR',
                message: 'Could not find authenticated user.'
            }
        }
        else {
            let body = await response.json();
            return body.results[0];
        }
    }
}
