import React from 'react';
import { getUrl } from "../common/site.js"

export default function Observation(props) {

    const observation = props.observation;
    const currentSite = props.currentSite;

    function setImageSizeUrl(url, size) {
        return url.replace('square.jpeg', `${size}.jpeg`)
    }

    function renderQualityGrade() {
        const qualityGrade = observation.quality_grade;
        let qualityGradeText = "";
        if (qualityGrade == 'research') {
            qualityGradeText = "Research Grade";
        } else if (qualityGrade == 'casual') {
            qualityGradeText = "Casual";
        }
        if (qualityGradeText) {
            const className = `quality_grade ${qualityGrade}`;
            return <div className={className}>{qualityGradeText}</div>;
        }
    }

    return (
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
            <div className='observation_info'>
                <div>Photos: {observation.photos.length}</div>
                <div>IDs: {observation.identifications.length}</div>
                <div>Comments: {observation.comments.length}</div>
                { renderQualityGrade() }
            </div>
        </div>
    );
}
