import React, { useState, useEffect } from 'react';
import SiteHeader from "../common/components/SiteHeader.jsx"

export default function BulkSendMessage() {

    function userLoadChanged(){}
    function authenticate(){}
    function logout(){}
    function loadUsers(){}
    function clearUsers(){}
    function sendMessages(){}
    function cancelLoad(){}

    return (
        <div>
            <SiteHeader/>

            <h1>Bulk Send Messages prototype for iNaturalist</h1> 
    
            <fieldset>
                <legend>Information</legend>
                This tool can be used to message many iNaturalist users at once, and may be a great way to contact many people about something you think they'd like to hear.<br/>
                Please note that using this for spam or harrasment will likely get your account and IP blocked by iNaturalist.<br/>
                Also, you may like to consider that there may be another way of contacting people if you have that available such as posting a project journal entry to reach everyone on a project for example.
            </fieldset>
            <fieldset>
                <legend>Warning</legend>
                This page won't work well on Internet Explorer, or old versions of browsers.
            </fieldset>

            <h2>Start here:</h2>
            <ol>
                <li>
                    <div id="authenticate_section" style={{fontSize: "smaller", display: "none"}}>
                        <input type="button" value='Check authentication' onClick={authenticate}/>
                        with <span id="authenticate_site_url"></span> (<a href="site_selection.html">change</a>)
                    </div>
                    <div id="authenticated_user" className="user" style={{display: "none"}}>
                        Logged in as: <user-info id="auth_user_info"></user-info>
                        <button onClick={logout}>Logout</button>
                    </div>
                </li>
                <fieldset id="non_auth_fields" disabled style={{border: 'none',display:'inherit',margin:0,padding:0}}>
                    <li>
                        <legend>Choose data source to load users from:</legend>
                        <label><input type="radio" name="user_load" value="user_ids" onChange={userLoadChanged} defaultChecked />User logins or IDs</label><br/>
                        <label><input type="radio" name="user_load" value="fileUpload" onChange={userLoadChanged}  />Export file (CSV or JSON)</label><br/>
                        <label><input type="radio" name="user_load" value="observation_ids" onChange={userLoadChanged}  />Observation IDs</label><br/>
                        <label><input type="radio" name="user_load" value="project_id" onChange={userLoadChanged}  />Project ID</label><br/>
                    </li>
                    <li>
                        <div id="user_ids_container">
                            Enter comma separated list of user logins or ids. e.g. johnsmith736,khaleesi89<br/>
                            <input type="search" id="user_ids"/>
                        </div>
                        <div id="fileUpload_container">
                            Load from observations export file (CSV or JSON format) to message the observers of the observations.<br/>
                            <input type="file" id="fileUpload" accept=".csv,.json" />
                        </div>
                        <div id="observation_ids_container">
                            Enter comma separated list of observation ids to message the observers of the observations.<br/>
                            <input type="search" id="observation_ids"/>
                        </div>
                        <div id="project_id_container">
                            Enter a project id to load its members. This is in the url on the project page. e.g. example-project-name<br/>
                            <input type="search" id="project_id"/>
                        </div>
                    </li>
                    <li>
                        <div id="load_users_section">
                            <input type="button" value='Load Users' onClick={loadUsers}/>
                            <input id="users_clear_button" type="button" style={{display:'none'}} value='Clear All Users' onClick={clearUsers}/>
                        </div>
                        <span id="user_loading" style={{display: 'none'}}>
                            <progress id="user_loading_progress" value="50" max="100">50 of 100</progress>
                            <label id="user_loading_label" htmlFor="user_loading_progress">50 of 100</label>
                            <button id="user_loading_cancel" onClick={cancelLoad}>Cancel</button>
                        </span>
                        <span id='user_load_errors'className='errorMessage'></span>
                        <div id='users_found' className="user"></div>
                    </li>
                    <li>Enter subject <br/>
                        <input type="text" id="subject"/>
                    </li>
                    <li>Enter message. You can use <i>[login]</i> in your message, and it will be replaced with their login name.<br/>
                        <textarea id='message'></textarea>
                    </li>
                    <li>
                    <input id="send" type="button" value='Send Messages' onClick={sendMessages}/><br/>
                    <div>
                        <p id="send_result"></p>
                        <progress id="send_progress" style={{display: 'none'}}></progress>
                    </div>
                    </li>
                </fieldset>
            </ol>

            <br/>
            <br/>
            <h5>Still to work on for this prototype: <a href="https://github.com/seanclifford/inat-prototype-site/projects/1">Github project todo list</a></h5>
        </div>
    );
}
