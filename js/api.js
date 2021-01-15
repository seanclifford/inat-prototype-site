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
    getUser: async function(userId) {
        let response = await Api.limiter(async () => { return await fetch(API_ENDPOINT + 'users/' + userId, Api.getFetchOptions);});
        let body = await response.json();
        return body.results[0];
    },
    sendMessage: async function(toUserId, subject, message, authToken) {
        let bodyObj = {
            "message": {
                "to_user_id": toUserId,
                "thread_id": 0,
                "subject": subject,
                "body": message
            }
        };
        await Api.limiter(async () => { return await fetch(API_ENDPOINT + 'messages', Api.postFetchOptions(bodyObj, authToken));});
    },
    getFetchOptions: {
        method: 'GET',
        headers: {
            'User-Agent': 'agoranomos - INat Prototypes'
        }
    },
    postFetchOptions: function(bodyObj, authToken) {
        return {
            method: 'POST',
            headers: {
                'User-Agent': 'agoranomos - INat Prototypes',
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': authToken
            },
            body: JSON.stringify(bodyObj)
        };
    }
}
