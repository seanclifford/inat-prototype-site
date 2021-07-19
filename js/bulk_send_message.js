let users = new Map();
let loadUsersCancelToken = false;

function getUsersFromFile(fileUpload) {

    const fileName = fileUpload.name;
    const type = fileName.split('.').pop();

    var reader = new FileReader();
    reader.onload = async function (e) {
        if (type.toUpperCase() == "CSV") {
            await getUsersFromExportCSV(e.target.result);
        } else {
            observations = JSON.parse(e.target.result);
            getUsersByObservations(observations.results); 
        }
    }
    reader.readAsText(fileUpload);
}

async function getUsersFromExportCSV(csvFileContents) {
    const objects = csvToObjectArray(csvFileContents);
    const userIds = [...new Set(objects.map(obj => obj.user_login))];
    await getUsersByNamesArray(userIds);
}

function csvToObjectArray(strData) {
    //Copied and edited from: https://gist.github.com/plbowers/7560ae793613ee839151624182133159
    const objPattern = new RegExp(("(\\,|\\r?\\n|\\r|^)(?:\"((?:\\\\.|\"\"|[^\\\\\"])*)\"|([^\\,\"\\r\\n]*))"),"gi");
    let arrMatches = null, arrData = [[]];
    while (arrMatches = objPattern.exec(strData)){
        if (arrMatches[1].length && arrMatches[1] !== ",") arrData.push([]);
        arrData[arrData.length - 1].push(arrMatches[2] ? 
            arrMatches[2].replace(new RegExp( "[\\\\\"](.)", "g" ), '$1') :
            arrMatches[3]);
    }
    const hData = arrData.shift();
    const hashData = arrData
        .filter(row => {return row.length > 1 || String(row[0])})
        .map(row => {
            let i = 0;
            return hData.reduce(
                (acc, key) => { 
                    acc[key] = row[i++]; 
                    return acc; 
                },
                {}
            );
        });
    return hashData;
}

async function getUsersByObservationsCsv(observationIdsCsv) {
    let convertedCsv = observationIdsCsv.replace(/\s/g,'');
    if (convertedCsv.split(',').length > 200) {
        setLoadUserError('Loading more than 200 observations at once is not supported.');
    }
    else {
        let observations = await Api.getObservations(convertedCsv);
        getUsersByObservations(observations);
    }
}

function getUsersByObservations(observations) {
    if (observations.status === 'ERROR') {
        setLoadUserError(observations.message);
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
    let page = 1;
    let totalPages = 1;
    let resultsCount = 0;
    do {
        if(loadUsersCancelToken) {
            reportGetUsersProgress(0,0);
            break;
        }
        const response = await Api.getProjectMembers(projectId, page);
        if (response.status == "ERROR") {
            setLoadUserError(response.message);
            break;
        }
        totalPages = Math.ceil(response.total_results / response.per_page);
        const projectMembers = response.results;
        const projectUsers = projectMembers.map(member => member.user);
        projectUsers.forEach(user => {
            addUser(user);
        });
        resultsCount += projectUsers.length;
        reportGetUsersProgress(resultsCount, response.total_results);
        //console.log(`page=${page} count=${projectMembers.length} users=${users.size}`);
        page++;
    } while (page <= totalPages);
}

async function getUsersByNamesCsv(userNamesCsv) {
    const userNames = userNamesCsv.split(',');
    await getUsersByNamesArray(userNames)
}

async function getUsersByNamesArray(userNames) {
    userNames = userNames.map(s => s.trim());
    userNames.sort();
    for(let i = 0; i < userNames.length; i++) {
        if(loadUsersCancelToken) {
            reportGetUsersProgress(0,0);
            break;
        }

        let user = await Api.getUser(userNames[i])
        if (user.status === 'ERROR') {
            setLoadUserError(user.message);
        }
        else {
            addUser(user);
        }
        reportGetUsersProgress(i + 1, userNames.length);
    }
}

function addUser(user) {
    if (!users.has(user.login) && 
        (!authenticatedUser || 
            authenticatedUser.login !== user.login)) {

        users.set(user.login, user);
        addUserResult(user);
    }
}

function removeUser(userLogin) {
    users.delete(userLogin);
}

function clearUsers() {
    users.clear();
    resetUserResults();
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