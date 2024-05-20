import React from 'react';
import './feedEntryCard.css';
import { format } from 'date-fns'

const FeedEntryCard = props => {

    // Extract the entry from the props
    const entry = props.entry;

    return (
        <div className='feed-entry-card' onClick={() => window.open(entry.link)}>
            { entry.image_url && <img src={entry.image_url}></img> }
            <div className='feed-entry-body'>
                <p className='entry-title mb-3'>{entry.title}</p>
                <p className='entry-author'>{entry.author}</p>
                <p className='entry-published mb-3'>{format(Date.parse(entry.published), 'dd MMM yyyy')}</p>
                <p className='entry-summary'>{entry.parsed_summary}</p>
            </div>
        </div>
    )
};

export default FeedEntryCard