const API_ENDPOINT = 'https://api.inaturalist.org/v1/';

var Api = {
    getUserName: async function(user){
        let user = getUser(user);
        alert(user.results[0].name);
    },
    
    getUser: async function(user){
        let response = await fetch(API_ENDPOINT + '/users/' + user);

        return await response.json()
    }
}
