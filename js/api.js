const API_ENDPOINT = 'https://api.inaturalist.org/v1/';

const delay = ms => new Promise(res => setTimeout(res, ms));

//Rate limiter
var limitFactory = function(){
    const LIMIT = 1000;
    var nextTime = window.performance.now();
    var difference = 0;
    return async function limit(func){
        
        difference = (nextTime - window.performance.now());
        
        if (difference > 0) {
            nextTime += LIMIT;
            await delay(difference);
        }
        else {
            nextTime = window.performance.now() + LIMIT;
        }
        return func();
    }
}

var Api = {
    limiter: limitFactory(),
    ensureAuthenticated: async function()
    {
        token = await getApiToken();
        if (!token) {
            storePreAuthPage();
            await authRequest();
        }
    },
    getUser: async function(userId) {
        let response = await Api.limiter(async () => { return await fetch(API_ENDPOINT + 'users/' + userId, Api.getFetchOptions);});
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
    getProjectMembers: async function(projectId) {
        let response = await Api.limiter(async () => { return await fetch(API_ENDPOINT + 'projects/' + projectId + '/members', Api.getFetchOptions);});
        if (!response.ok) {
            return {
                status: 'ERROR',
                message: `Could not load project members for project '${projectId}'`
            }
        }
        else {
            let body = await response.json();
            return body.results;
        }
    },
    getObservations: async function(observationIds) {
        let response = await Api.limiter(async () => { return await fetch(API_ENDPOINT + 'observations/' + observationIds, Api.getFetchOptions);});
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
        let response = await Api.limiter(async () => { return await fetch(API_ENDPOINT + 'sites/', Api.getFetchOptions);});
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
        //await Api.limiter(async () => {await delay(500);});
        //return { 
        //            status: 'OK',
        //       };
        let bodyObj = {
            "message": {
                "to_user_id": toUser.id,
                "thread_id": 0,
                "subject": subject,
                "body": message
            }
        };
        let response = await Api.limiter(async () => { return await fetch(API_ENDPOINT + 'messages', Api.postAuthFetchOptions(bodyObj, authToken));});
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
        let response = await Api.limiter(async () => { return await fetch(API_ENDPOINT + 'users/me', Api.getAuthFetchOptions(authToken));});
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
    },
    getFetchOptions: {
        method: 'GET',
        headers: {
            'User-Agent': USER_AGENT
        }
    },
    getAuthFetchOptions: function(authToken) {
        return {
            method: 'GET',
            headers: {
                'User-Agent': USER_AGENT,
                'Authorization': authToken
            }
        };
    },
    postFetchOptions: function(bodyObj) {
        return {
            method: 'POST',
            headers: {
                'User-Agent': USER_AGENT,
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(bodyObj)
        };
    },
    postAuthFetchOptions: function(bodyObj, authToken) {
        return {
            method: 'POST',
            headers: {
                'User-Agent': USER_AGENT,
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': authToken
            },
            body: JSON.stringify(bodyObj)
        };
    }
}
