let users = [];

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
    users = [];

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

async function getUsersByProjectMembers(projectId) {
    resetUserResults();
    users = [];

    let projectMembers = await Api.getProjectMembers(projectId);
    const projectUsers = projectMembers.map(member => member.user);

    projectUsers.forEach(user => {
        addUser(user);
    });
}

async function getUsersByNamesCsv(userNamesCsv) {
    const userNames = userNamesCsv.split(',');
    await getUsersByNamesArray(userNames)
}

async function getUsersByNamesArray(userNames) {
    resetUserResults();
    users = [];
    
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
    users.push(user);
    var userHandle = user.login;
    if(user.name) {
        userHandle += ` (${user.name})`;
    }
    addUserResult({
        icon: user.icon,
        name: userHandle
    });
}

async function sendMessagesToUsers(subject, message, authToken, callback){ 
    let currMessage = 0;
    let results = await Promise.all(users.map(async (user) => {
        const userMessage = setMessageVariablesForUser(message, user);
        let result = await Api.sendMessage(user.id, subject, userMessage, authToken);
        callback(user, ++currMessage, users.length);
        return result;
    }));

    let errorResults = results.filter(result => result.status === 'ERROR');
    let successCount = results.length - errorResults.length;
    let sendMessageResult = `Successfully sent ${successCount} out of ${results.length} messages.`;
    if (errorResults.length > 0) {
        sendMessageResult += ' ERRORS:';
        errorResults.forEach(error => sendMessageResult += error.message + ' ');
    }
    
    return sendMessageResult;
}

function setMessageVariablesForUser(message, user) {
    let result = message.replace('[user]', user.login);
    result = result.replace('[observation_count]', user.observation_count);

    return result;
}