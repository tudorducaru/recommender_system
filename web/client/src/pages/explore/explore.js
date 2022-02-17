import React, { useEffect, useState }  from 'react';
import './explore.css';
import DataService from '../../services/dataService';

const Explore = () => {

    // Keep the feeds in local state
    const [feeds, setFeeds] = useState([]);

    // Load feeds from the database when the page loads
    useEffect(() => {

        DataService.getFeeds(0)
            .then((data) => setFeeds(data))
            .catch(errorMessage => console.log(errorMessage));

    }, []);


    return (
        <div>
            <h1>Explore</h1>
            { feeds.map((feed) => <p key={feed.id}>{feed.id}</p>) }
        </div>
    )
}

export default Explore