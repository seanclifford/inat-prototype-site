const API_ENDPOINT = 'https://api.inaturalist.org/v1/';

var Api = {
    getUserName: async function(userId){
        let user = getUser(userId);
        alert(user.results[0].name);
    },
    
    getUser: async function(userId){
        let response = await fetch(API_ENDPOINT + '/users/' + userId);

        return await response.json()
    }
}
