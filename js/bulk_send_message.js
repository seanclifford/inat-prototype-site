let users = new Map();

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
    const userIds = objects.map(obj => obj.user_id);
    await getUsersByNamesArray(userIds);
}

function csvToObjectArray(data) {
    //CODE pulled from: https://stackoverflow.com/a/64396703/1817
    // Split data into lines and separate headers from actual data
    // using Array spread operator
    const [headerLine, ...lines] = data.split('\n');

    // Use common line separator, which parses each line as the contents of a JSON array
    const parseLine = (line) => JSON.parse(`[${line}]`);

    // Split headers line into an array
    const headers = parseLine(headerLine);

    // Create objects from parsing lines
    // There will be as much objects as lines
    const objects = lines
    .map( (line, index) =>

        // Split line with JSON
        parseLine(line)

        // Reduce values array into an object like: { [header]: value } 
        .reduce( 
            (object, value, index) => ({
            ...object,
            [ headers[index] ]: value,
            }),
            {}
        ) 
    );

    return objects;
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