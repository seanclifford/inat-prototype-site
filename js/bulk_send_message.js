import { Api } from "./api.js";
import { ensureAuthenticated, clearAllAuthenticationState } from "./auth.js";
import { getCurrentSite } from "./site.js";
import { getAuthenticatedUser } from "./user.js";

let users = new Map();
let loadUsersCancelToken = false;

export function getUsersFromFile(fileUpload) {

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

export async function getUsersByObservationsCsv(observationIdsCsv) {
    let convertedCsv = observationIdsCsv.replace(/\s/g,'');
    if (convertedCsv.split(',').length > 200) {
        setLoadUserError('Loading more than 200 observations at once is not supported.');
    }
    else {
        let observations = await Api.getObservations(convertedCsv);
        getUsersByObservations(observations);
    }
}

export function getUsersByObservations(observations) {
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

export async function getUsersByProjectMembers(projectId) {
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

export async function getUsersByNamesCsv(userNamesCsv) {
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

export function removeUser(userLogin) {
    users.delete(userLogin);
}

export function clearUsers() {
    users.clear();
    resetUserResults();
}

export async function sendMessagesToUsers(subject, message, authToken, callback){ 
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

/* Element accessing functions */

export function test(){
    console.log('go');
}

export async function authenticate() {
  await ensureAuthenticated();
  await showAuthenticatedUser();
}

export async function showAuthenticatedUser() {
  const user = await getAuthenticatedUser();
  if (user) {
    const authUserInfo = document.getElementById('auth_user_info');
    authUserInfo.setAttribute('img', user.icon);
    authUserInfo.setAttribute('login', user.login);
    authUserInfo.setAttribute('name', user.name);
    document.getElementById('authenticated_user').style.display = '';
    document.getElementById('authenticate_section').style.display = 'none';
    document.getElementById('non_auth_fields').disabled = false;
  }
  else {
    document.getElementById('authenticated_user').style.display = 'none';
    document.getElementById('authenticate_section').style.display = '';
    document.getElementById('non_auth_fields').disabled = true;
  }
}

export function logout() {
  clearAllAuthenticationState();
  showAuthenticatedUser();
}

export async function showCurrentSite() {
  const currentSite = await getCurrentSite();
  const siteHeader = document.getElementById("site_header");
  siteHeader.setSite(currentSite);
  const authSiteUrl = document.getElementById("authenticate_site_url");
  authSiteUrl.textContent = new URL(currentSite.url).hostname;
}

export function userLoadChanged() {
  const radioButtons = document.getElementsByName("user_load");
  for (let i = 0; i < radioButtons.length; i++) {
    let radioButton = radioButtons[i];
    let inputContainerDisplay = 'none';
    if (radioButton.checked) {
      inputContainerDisplay = 'block';
    }
    const inputContainer = document.getElementById(`${radioButton.value}_container`);
    inputContainer.style.display = inputContainerDisplay;
  }
}

export async function loadUsers() {
  clearLoadUserErrors();
  const userLoadType = document.querySelector('input[name="user_load"]:checked').value;
  switch(userLoadType)
  {
    case 'fileUpload':
      let fileUpload = document.getElementById("fileUpload").files[0];
      if (!fileUpload){
        setLoadUserError('No file selected.');
        return;
      }
      getUsersFromFile(fileUpload);
      break;
    case 'user_ids':
      let userNamesCsv = document.getElementById("user_ids").value;
      await getUsersByNamesCsv(userNamesCsv);
      break;
    case 'observation_ids':
      let observationIdsCsv = document.getElementById("observation_ids").value;
      await getUsersByObservationsCsv(observationIdsCsv);
      break;
    case 'project_id':
      let projectId = document.getElementById("project_id").value;
      await getUsersByProjectMembers(projectId);
      break;
    default:
      alert('Enter some user names or observation ids, observations file or project id')
  }
  setSendButtonText();
  setClearUsersButtonVisibility();
}     

export async function sendMessages(){ 
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value;
  const apiToken = await getApiToken();
  const resultPara = document.getElementById('send_result');
  resultPara.textContent = 'Sending...';
  const result = await sendMessagesToUsers(subject, message, apiToken, onMessageSend);
  
  resultPara.textContent = result;
  const sendProgress = document.getElementById('send_progress');
  sendProgress.style.display = 'none';
}

function onMessageSend(user, currentNum, totalCount) {
  const resultPara = document.getElementById('send_result');
  resultPara.textContent = `Sent message ${currentNum} of ${totalCount} to user ${user.login}...`;
  
  const sendProgress = document.getElementById('send_progress');
  sendProgress.value = currentNum;
  sendProgress.max = totalCount;
  sendProgress.style.display = '';
}

function reportGetUsersProgress(progress, total) {
  const loadUsersButton = document.getElementById('load_users_section');
  const userLoadingSection = document.getElementById('user_loading');
  if (progress >= total) {
    loadUsersButton.style.display = '';
    userLoadingSection.style.display = 'none';
    loadUsersCancelToken = false;
    document.getElementById('user_loading_cancel').disabled = false;
  } else {
    const load_progress = document.getElementById('user_loading_progress');
    const progress_label = document.getElementById('user_loading_label');
    load_progress.value = progress;
    load_progress.max = total;
    load_progress.textContent = progress_label.textContent = `Loading... (${progress} of ${total})`;
    loadUsersButton.style.display = 'none';
    userLoadingSection.style.display = '';
  }
}

export function cancelLoad() {
  loadUsersCancelToken = true;
  document.getElementById('user_loading_cancel').disabled = true;
}

function setLoadUserError(error) {
  let div = document.getElementById('user_load_errors');
  div.textContent += error + ' ';
}

function clearLoadUserErrors() {
  let div = document.getElementById('user_load_errors');
  div.textContent = '';
}

function resetUserResults() {
  document.getElementById('users_found').innerHTML = "";
  document.getElementById('user_load_errors').innerHTML = "";
  setSendButtonText();
  setClearUsersButtonVisibility();
}

function addUserResult(userResult) {
  let div = document.getElementById('users_found');
  let userInfo = document.createElement('user-info');
  userInfo.setAttribute('img', userResult.icon);
  userInfo.setAttribute('login', userResult.login);
  userInfo.setAttribute('name', userResult.name);
  userInfo.setAttribute('onremove', 'removeUserFromResults(this)');
  div.appendChild(userInfo);
}

export function removeUserFromResults(userInfoElement) {
  const userLogin = userInfoElement.getAttribute('login');
  removeUser(userLogin);
  const div = document.getElementById('users_found');
  div.removeChild(userInfoElement);
  setSendButtonText();
  setClearUsersButtonVisibility();
}

function setSendButtonText() {
  const sendButton = document.getElementById("send");
  if(users && users.size > 0) {
    sendButton.value = `Send ${users.size} Message`
    if (users.size != 1){
      sendButton.value += 's'
    }
  }
  else {
    sendButton.value = 'Send Messages';
  }
}

function setClearUsersButtonVisibility()
{
  const buttonStyle = document.getElementById('users_clear_button').style;
  if(users && users.size > 0) {
    buttonStyle.display = '';
  }
  else {
    buttonStyle.display = 'none';
  }
}