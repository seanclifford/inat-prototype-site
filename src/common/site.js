import { Api } from "./api/api.js";

export async function getCurrentSite(){
    let current_site = localStorage.getItem('current_site');
    if (current_site) {
        return JSON.parse(current_site);
    }
    
    let allSites = await getAllSites();
    current_site = allSites[0];
    setCurrentSite(current_site);

    return current_site;
}

export async function setCurrentSiteById(siteId) {
    let allSites = await getAllSites();
    let currentSite = allSites.find(site => site.id == siteId);
    setCurrentSite(currentSite);
}

function setCurrentSite(site) {
    localStorage.setItem('current_site', JSON.stringify(site));
}

export async function getAllSites() {
    let allSites = sessionStorage.getItem('all_sites');
    if (allSites) {
        return JSON.parse(allSites);
    }

    allSites = await Api.getSites();
    sessionStorage.setItem('all_sites', JSON.stringify(allSites));

    return allSites;
}

export function clearSites() {
    sessionStorage.removeItem('all_sites');
    localStorage.removeItem('current_site');
}

export async function getSiteUrl(path) {
    const currentSite = await getCurrentSite();
    const url = new URL(path, currentSite.url);
    return url.toString();
}

export function getUrl(currentSite, path) {
    const url = new URL(path, currentSite.url);
    return url.toString();
}
