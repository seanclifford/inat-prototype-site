import { getCurrentSite, getAllSites, setCurrentSiteById } from "./site.js"

globalThis.saveCurrentSite = saveCurrentSite;

(async () => {
  let allSites = await getAllSites();
  let currentSite = await getCurrentSite();
  
  allSites.forEach(site => {
    let isCurrent = site.id == currentSite.id;
    addSite(site, isCurrent);
  });
})();

function addSite(site, isCurrent) {
   const div = document.getElementById('all_sites');
   const template = document.getElementById('site_template');
   const clone = template.content.cloneNode(true);
   const radioButton = clone.querySelector('input');
   radioButton.value = site.id;
   radioButton.checked = isCurrent;
   const image = clone.querySelector('img');
   image.src = site.icon_url;
   const siteName = clone.querySelector('.site_name');
   siteName.textContent = site.name;
   const siteLink = clone.querySelector('a');
   siteLink.href = site.url;
   siteLink.textContent = site.url;
   div.append(clone);
}

async function saveCurrentSite()
{
  let selectedRadio = document.querySelector("input[name=selected_site]:checked");
  if (selectedRadio) {
    let currentSiteId = selectedRadio.value;
    await setCurrentSiteById(currentSiteId);
  }
  let currentSite = await getCurrentSite();
  alert(`This site will use ${currentSite.name} for iNaturalist interactions`);
  window.history.back();
}