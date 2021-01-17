let userIds = [];

function getUsersFromFile(fileUpload) {
    var reader = new FileReader();
    reader.onload = function (e) {
        observations = JSON.parse(e.target.result);
        getUsersByObservations(observations.results); 
    }
    reader.readAsText(fileUpload);
}

async function getUsersByObservationsCsv(observationIdsCsv) {
    let convertedCsv = observationIdsCsv.replace(/\s/g,'');
    let observations = await Api.getObservations(convertedCsv);
    getUsersByObservations(observations);
}

function getUsersByObservations(observations) {
    resetUserResults();
    if (observations.status === 'ERROR'){
        setError(observations.message);
    }
    else {
        const obsUsers = observations.map(observation => observation.user);
        const uniqueObsUsers = [];
        const map = new Map();
        for (const user of obsUsers) {
            if(!map.has(user.id)){
                map.set(user.id, true);
                uniqueObsUsers.push(user);
            }
        }
        uniqueObsUsers.forEach(user => {
            addUser(user);
        });
    }
}

async function getUsersByNamesCsv(userNamesCsv) {
    const userNames = userNamesCsv.split(',');
    await getUsersByNamesArray(userNames)
}

async function getUsersByNamesArray(userNames) {
    resetUserResults();
    
    for(let i = 0; i < userNames.length; i++) {
        let user = await Api.getUser(userNames[i])
        if (user.status === 'ERROR') {
            setError(user.message);
        }
        else {
            addUser(user);
        }
    }
}

function addUser(user) {
    userIds.push(user.id);
    var userHandle = user.login;
    if(user.name) {
        userHandle += ` (${user.name})`;
    }
    addUserResult({
        icon: user.icon,
        name: userHandle
    });
}

async function sendMessagesToUsers(subject, message, authToken){ 
    let results = await Promise.all(userIds.map(async (userId) => {
        return await Api.sendMessage(userId, subject, message, authToken);
    }));

    let errorResults = results.filter(result => result.status === 'ERROR');
    let successCount = results.length - errorResults.length;
    let sendMessageResult = `Successfully sent ${successCount} out of ${results.length} message.`;
    if (errorResults.length > 0) {
        sendMessageResult += ' ERRORS:';
        errorResults.forEach(error => sendMessageResult += error.message + ' ');
    }
    
    return sendMessageResult;
}