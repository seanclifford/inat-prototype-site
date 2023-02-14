import React, { useState, useEffect } from "react";
import { getCurrentSite } from "../site";
import "./SiteHeader.css"

export default function SiteHeader() {
    const [site, setSite] = useState({});

    useEffect(() => {
        (async () => {
            const site = await getCurrentSite();
            setSite(site);
          })();
    }, []);

    if (site.id) {
        return (
            <span className="affiliation">
                <img className="site_img" src={site.icon_url}></img>
                <span className="site_title">{site.site_name_short}</span>
                (<a href="/site_selection.html">change</a>) 
            </span>
        );
    }
}