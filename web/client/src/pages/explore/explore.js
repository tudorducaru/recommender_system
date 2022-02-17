import React, { useEffect, useState } from 'react';
import './explore.css';
import DataService from '../../services/dataService';
import FeedCard from '../../components/feedCard/feedCard';

const Explore = () => {

    // Keep the feeds in local state
    const [feeds, setFeeds] = useState([]);

    // Keep track of the current page
    const [page, setPage] = useState(0);

    // Load feeds from the database when the page loads
    useEffect(() => {

        DataService.getFeeds(page)
            .then((data) => setFeeds(data))
            .catch(errorMessage => console.log(errorMessage));

    }, []);

    console.log(feeds);

    // Handle clicks on the load more button
    const handleLoadMore = () => {

        // Get data for the next page
        DataService.getFeeds(page + 1)
            .then((data) => {

                // Increment the page
                setPage(prevPage => prevPage + 1);

                // Append the feeds to the local state
                setFeeds([...feeds, ...data]);
            })
            .catch(errorMessage => console.log(errorMessage));

    };

    return (
        <div style={{margin: '0 auto', width: '600px'}}>
            <button onClick={handleLoadMore}>Load More</button>
            {
                feeds.map((feed) => <FeedCard feed={feed} />)
            }
        </div>
    )
}

export default Explore