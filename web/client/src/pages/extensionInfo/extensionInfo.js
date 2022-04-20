import React from 'react';
import './extensionInfo.css';
import extension_ss from '../../extension_ss.JPG';
import extension_success_ss from '../../extension_success_ss.JPG';

const ExtensionInfo = () => {
    return (
        <div className='feeds-container extension-info-container mb-5'>
            <h1>Chrome Extension</h1>
            
            <div className='divider'></div>

            <p className='mt-3'>FeedSupply has an accompanying Chrome Browser Extension, called FeedSupply assistant. The extension can be installed from the <a href='https://chrome.google.com/webstore/detail/feedsupply-assistant/lhmjggdmmikaoeplnfhbbbalcdclcfhb'>Chrome Web Store</a>.</p>

            <p>The purpose of the extension is to help you quickly and easily add feeds to your Liked Feeds, directly from the website that generates that feed.</p>

            <img src={extension_ss}></img>

            <p className='mt-3'>The extension automatically detects whether you are logged in or not. When opening the extension on a given website, it searches through that website's source for an RSS feed and, if one is found, displays the URL of the feed as well as the option to add it to your profile.</p>

            <img src={extension_success_ss}></img>
        </div>
    );
};

export default ExtensionInfo;