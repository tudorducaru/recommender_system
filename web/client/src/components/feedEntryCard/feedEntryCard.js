import React from 'react';
import './feedEntryCard.css';

const FeedEntryCard = props => {

    // Extract the entry from the props
    const entry = props.entry;

    return (
        <div className='feed-entry-card'>
            <img src={ entry.image_url }></img>
            <p>{ entry.title }</p>
            <p>{ entry.author }</p>
            <p>{ entry.published }</p>
            <p>{ entry.parsed_summary }</p>
        </div>
    )
};

export default FeedEntryCard