var Api = {
    getUserName: async function(user){
        fetch('https://api.inaturalist.org/v1/users/' + user, {
            headers: {
                Accept: 'application/json'
            }
        })
            .then( 
                response => {
                    if (!response.ok)
                    {
                        alert('BAD')
                    }
                    else
                    {
                        alert('GOOD ' + response.json())
                    }
                }
            );
    }
    



}
