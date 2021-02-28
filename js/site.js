async function getCurrentSite(){
    let current_site = localStorage.getItem('current_site');
    if (current_site) {
        return current_site;
    }
    
    let allSites = await getAllSites();
    current_site = allSites[0];
    setCurrentSite(current_site);

    return current_site;
}

function setCurrentSite(site) {
    localStorage.getItem('current_site', site);
}

async function getAllSites() {
    let allSites = sessionStorage.getItem('all_sites');
    if (allSites) {
        return allSites;
    }

    allSites = await Api.getSites();
    sessionStorage.setItem('all_sites', allSites);

    return allSites;
}

function clearSites() {
    sessionStorage.removeItem('all_sites');
    localStorage.removeItem('current_site');
}