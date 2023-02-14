import React, { useState } from 'react';
import "./AutoCombineSuggest.css"
import SiteHeader from "../common/components/SiteHeader.jsx"

export default function AutoCombineSuggest() {
    const [observationIds, setObservationIds] = useState('');

    function checkObservations() {

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
                    <div id='observations_found'></div>
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
