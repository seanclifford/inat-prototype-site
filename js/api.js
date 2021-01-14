const API_ENDPOINT = 'https://api.inaturalist.org/v1/';

const delay = ms => new Promise(res => setTimeout(res, ms));

//Rate limiter
var limitFactory = function(){
    const LIMIT = 1000;
    var nextTime = window.performance.now();
    var difference = 0, count = 0;
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
    getUser: async function(userId){
        let response = await Api.limiter(async () => { return await fetch(API_ENDPOINT + 'users/' + userId);});
        let body = await response.json();
        return body.results[0];
    }
}
