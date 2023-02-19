import React, { useState, useEffect } from 'react';
import "./AutoCombineSuggest.css"
import SiteHeader from "../common/components/SiteHeader.jsx"
import { getCurrentSite } from "../common/site.js"
import { Api } from "../common/api/api.js"
import UserInfo from '../common/components/UserInfo.jsx';
import Observation from './Observation.jsx';
import { THIS_SITE_URI } from '../common/constants.js';

export default function AutoCombineSuggest() {
    const [observationIds, setObservationIds] = useState('');
    const [observations, setObservations] = useState([]);
    const [currentSite, setCurrentSite] = useState();
    const [linkUri, setLinkUri] = useState('');
    
    useEffect(() => {
        (async () => {
           const site = await getCurrentSite();
           setCurrentSite(site);
        })();
      }, []);

    useEffect(() => {
        if (observationIds.length == 0) return;

        const autoCombineUrl = new URL(`${THIS_SITE_URI}/auto_combine.html`);
        autoCombineUrl.searchParams.append('observation_ids', getObservationIdCsv())
      
        setLinkUri(autoCombineUrl.toString());
    }, [observationIds]);

    function getObservationIdCsv() {
        const convertedCsv = observationIds.replace(/\s/g,'');
        return convertedCsv;
      }

    async function checkObservations() {
        setObservations(await Api.getObservations(getObservationIdCsv()));
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
            return (
            <div>
                <UserInfo img={author.icon_url} login={author.login} name={author.name}/>
                {observations.map((observation) => 
                    <Observation 
                        currentSite={currentSite} 
                        observation={observation}
                        key={observation.id}/>)}
            </div>);
        }
    }

    return (
        <div>
            <SiteHeader/>

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
                <li>
                    Copy the link and add it to a comment <br/>
                    <input type="text" id="link" value={linkUri} readOnly/>
                </li>
            </ol>

            <br/>
            <br/>
            <h5>Still to work on for this prototype: <a href="https://github.com/seanclifford/inat-prototype-site/projects/2">Github project todo list</a></h5>
        </div>
    );
}
