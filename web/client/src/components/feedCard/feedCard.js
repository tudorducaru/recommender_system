import React from 'react';
import './feedCard.css';

const FeedCard = props => {

    // Get the feed from the props
    const feed = props.feed;

    return (
        <div className='feed-card mb-3 px-3 py-2' key={ feed.id }>
            <p className='feed-card-title'>
                { feed.title }
            </p>
            <p className='feed-card-description mb-0'>
                { feed.description }
            </p>
        </div>
    )
};

export default FeedCard;