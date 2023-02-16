import React, { useState, useEffect } from 'react';
import "./AutoCombineSuggest.css"
import SiteHeader from "../common/components/SiteHeader.jsx"
import {getCurrentSite, getUrl} from "../common/site.js"
import {Api} from "../common/api/api.js"

export default function AutoCombineSuggest() {
    const [observationIds, setObservationIds] = useState('');
    const [observations, setObservations] = useState([]);
    const [currentSite, setCurrentSite] = useState();
    
    useEffect(() => {
        (async () => {
           const site = await getCurrentSite();
           setCurrentSite(site);
        })();
      }, []);

    function getObservationIdCsv() {
        const convertedCsv = observationIds.replace(/\s/g,'');
        return convertedCsv;
      }

    async function checkObservations() {
        setObservations(await Api.getObservations(getObservationIdCsv()));
    }

    function setImageSizeUrl(url, size) {
        return url.replace('square.jpeg', `${size}.jpeg`)
      }

    function renderObservations() {
        if (observations.length == 0) {
            return;
        }
        const distinctUserLogins = [...new Set(observations.map(o => o.user.login))];
        if (distinctUserLogins.length > 1) {
            return `These observations are not owned by the same user. You have entered observations for: ${distinctUserLogins.toString()}`;
        } else {
            let author = observations[0].user;
            //TODO user-info component
            return (
            <div>
                {observations.map((observation) => (
                    <div className='observation'>
                        <div className='observation_header'>
                            <a href={getUrl(currentSite, `/observations/${observation.id}`)}>
                                {observation.id} - {observation.species_guess}
                            </a>
                        </div>
                        <div>{observation.observed_on_string}</div>
                        {
                            observation.photos.length > 0 ? 
                                (<img src={setImageSizeUrl(observation.photos[0].url, 'small')}></img>): ''
                        }
                    </div>
                ))}
            </div>);
        }
    }

    function generateLink() {

    }


    return (
        <div>
            <SiteHeader></SiteHeader>

            <h1>Auto Combine Observations prototype for iNaturalist</h1> 
        
            This tool creates a suggestion link for an owner of some observations to automatically combine them into a single observation.<br/>
            This can be useful when finding new users that have not got the hang of the web uploader yet and end up creating multiple observations accidentally.
        
            <h2>Start here:</h2>
            <ol>
                <li>
                    Enter the observation IDs to merge in a comma separated list. The first one will be the one that's kept.<br/>
                    <input 
                        type="text" 
                        id="observation_ids" 
                        value={observationIds} 
                        onChange={e => setObservationIds(e.target.value)}
                        />
                </li>
                <li>
                    <input type="button" value='Check observations' onClick={checkObservations}/>
                    <div id='observations_found'>
                        {renderObservations()}
                    </div>
                </li>
                <li><input type="button" value='Generate link' onClick={generateLink}/><br/>
                    <input type="text" id="link"/>
                </li>
                <li>
                    Copy the link and add it to a comment
                </li>
            </ol>

            <br/>
            <br/>
            <h5>Still to work on for this prototype: <a href="https://github.com/seanclifford/inat-prototype-site/projects/2">Github project todo list</a></h5>
        </div>
    );
}
