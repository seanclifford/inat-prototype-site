import React from "react";
import "./UserInfo.css"

export default function UserInfo(props) {

    function getImage() {
        const defaultImgSrc = 'img/person.svg';
        let imgSource = props.img ?? defaultImgSrc;
        if (!imgSource || imgSource === 'null') {
            imgSource = defaultImgSrc;
        }
        return imgSource;
    }

    function getUserName() {
        let userName = props.name ?? '';
        if (!userName || userName === 'null') {
            userName = '';
        }
        return userName;
    }

    return (
        <div className="user_container">
            <img className="user_img" src={getImage()}></img>
            <div className="user_text">
                <div className='user_login'>{props.login}</div>
                <div className='user_name'>{getUserName()}</div>
            </div>
        </div>
    );
}