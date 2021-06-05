let users = new Map();

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
    users.clear();

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
    users.clear();
    let page = 1;
    let totalPages = 1;
    do {
        const response = await Api.getProjectMembers(projectId, page);
        if (response.status == "ERROR") {
            setError(response.message);
            break;
        }
        totalPages = response.total_results / response.per_page + 1;
        const projectMembers = response.results;
        const projectUsers = projectMembers.map(member => member.user);
        projectUsers.forEach(user => {
            addUser(user);
        });
        //console.log(`page=${page} count=${projectMembers.length} users=${users.size}`);
        page++;
    } while (page <= totalPages);
}

async function getUsersByNamesCsv(userNamesCsv) {
    const userNames = userNamesCsv.split(',');
    await getUsersByNamesArray(userNames)
}

async function getUsersByNamesArray(userNames) {
    resetUserResults();
    users.clear();
    
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
    users.set(user.login, user);
    addUserResult(user);
}

function removeUser(userLogin) {
    users.delete(userLogin);
}

async function sendMessagesToUsers(subject, message, authToken, callback){ 
    let currMessage = 0;
    let results = await Promise.all([...users.values()].map(async (user) => {
        const userMessage = setMessageVariablesForUser(message, user);
        let result = await Api.sendMessage(user, subject, userMessage, authToken);
        callback(user, ++currMessage, users.size);
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
    let result = message.replace('[login]', user.login);

    return result;
}