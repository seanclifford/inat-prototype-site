import React from 'react';
import "./AutoCombineSuggest.css"
import { SiteHeader } from "../common/components/SiteHeader.jsx"

export default function AutoCombineSuggest() {
    return (
        <div>
            <SiteHeader></SiteHeader>

            <h1>Auto Combine Observations prototype for iNaturalist</h1> 
        
            This tool creates a suggestion link for an owner of some observations to automatically combine them into a single observation.<br/>
            This can be useful when finding new users that have not got the hang of the web uploader yet and end up creating multiple observations accidentally.
        </div>
    );
}
