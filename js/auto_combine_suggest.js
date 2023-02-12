import { THIS_SITE_URI } from "../src/common/constants.js"
import { getCurrentSite, getSiteUrl } from "../src/common/site.js"
import { Api } from "../src/common/api/api.js"

globalThis.checkObservations = checkObservations;
globalThis.generateLink = generateLink;

(async () => {
  const currentSite = await getCurrentSite();

  const siteHeader = document.getElementById("site_header");
  siteHeader.setSite(currentSite);
})();

function getObservationIdCsv() {
  const observationIdsCsv = document.getElementById("observation_ids").value;
  const convertedCsv = observationIdsCsv.replace(/\s/g,'');
  return convertedCsv;
}

async function checkObservations() {
  const observations = await Api.getObservations(getObservationIdCsv());
  let observationsDiv = document.getElementById("observations_found");
  observationsDiv.innerHTML = "";
  const distinctUserLogins = [...new Set(observations.map(o => o.user.login))];
  if (distinctUserLogins.length > 1) {
    observationsDiv.textContent = `These observations are not owned by the same user. You have entered observations for: ${distinctUserLogins.toString()}`;
  }
  else {
    observationsDiv.textContent = '';
    
    let author = observations[0].user;
    let authorUserInfo = document.createElement('user-info');
    authorUserInfo.setAttribute('img', author.icon_url);
    authorUserInfo.setAttribute('login', author.login);
    authorUserInfo.setAttribute('name', author.name);
    observationsDiv.appendChild(authorUserInfo);

    observations.forEach(async (observation) => {
      let observationDiv = document.createElement('div');
      observationDiv.setAttribute('class', 'observation');
      
      let observationHeaderDiv = document.createElement('div');
      observationHeaderDiv.setAttribute('class', 'observation_header');
      let observationLink = document.createElement('a');
      observationLink.href = await getSiteUrl(`/observations/${observation.id}`);
      observationLink.textContent = `${observation.id} - ${observation.species_guess}`;
      observationHeaderDiv.append(observationLink);
      observationDiv.append(observationHeaderDiv);

      let observationDateTimeDiv = document.createElement('div');
      observationDateTimeDiv.textContent = observation.observed_on_string;
      observationDiv.append(observationDateTimeDiv);
      
      if (observation.photos.length > 0) {
        const observationFirstPhoto = document.createElement('img');
        const smallPhotoUrl = setImageSizeUrl(observation.photos[0].url, 'small');
        observationFirstPhoto.setAttribute('src', smallPhotoUrl);

        observationDiv.appendChild(observationFirstPhoto);
      }

      const statsList = document.createElement('div');
      statsList.setAttribute('class', 'observation_info');

      const photoCountItem = document.createElement('div');
      photoCountItem.textContent = `Photos: ${observation.photos.length}`;
      statsList.appendChild(photoCountItem);

      const idCountItem = document.createElement('div');
      idCountItem.textContent = `IDs: ${observation.identifications.length}`;
      statsList.appendChild(idCountItem);

      const commentsCountItem = document.createElement('div');
      commentsCountItem.textContent = `Comments: ${observation.comments.length}`;
      statsList.appendChild(commentsCountItem);

      const qualityGrade = observation.quality_grade;
      let qualityGradeText = "";
      if (qualityGrade == 'research') {
        qualityGradeText = "Research Grade";
      } else if (qualityGrade == 'casual') {
        qualityGradeText = "Casual";
      }
      if (qualityGradeText) {
        const qualityGradeItem = document.createElement('div');
        qualityGradeItem.setAttribute('class', `quality_grade ${qualityGrade}`);
        qualityGradeItem.textContent = qualityGradeText;
        statsList.appendChild(qualityGradeItem);
      }


      observationDiv.appendChild(statsList);

      observationsDiv.appendChild(observationDiv);
    });
  }
}

function setImageSizeUrl(url, size) {
  return url.replace('square.jpeg', `${size}.jpeg`)
}

function generateLink() {
  const autoCombineUrl = new URL(`${THIS_SITE_URI}/auto_combine.html`);
  autoCombineUrl.searchParams.append('observation_ids', getObservationIdCsv())

  const linkTextBox = document.getElementById('link');
  linkTextBox.value = autoCombineUrl.toString();
}