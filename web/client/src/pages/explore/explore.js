import React, { useEffect, useState } from 'react';
import './explore.css';
import DataService from '../../services/dataService';
import FeedCard from '../../components/feedCard/feedCard';
import Button from 'react-bootstrap/Button';;

const Explore = () => {

    // Keep the feeds in local state
    const [feeds, setFeeds] = useState([]);

    // Keep track of the current page
    const [page, setPage] = useState(0);

    // Keep track of the search term
    const [searchTerm, setSearchTerm] = useState();

    // Load feeds from the database when the page loads
    useEffect(() => {

        DataService.getFeeds(page)
            .then((data) => setFeeds(data))
            .catch(errorMessage => console.log(errorMessage));

    }, []);

    // Handle clicks on the load more button
    const handleLoadMore = () => {

        // Get data for the next page
        DataService.getFeeds(page + 1, searchTerm)
            .then((data) => {

                // Increment the page
                setPage(prevPage => prevPage + 1);

                // Append the feeds to the local state
                setFeeds([...feeds, ...data]);
            })
            .catch(errorMessage => console.log(errorMessage));

    };

    // Handle search form submissions
    const handleSearchSubmit = (e) => {

        // Prevent reloading page
        e.preventDefault();

        // Get feeds from the database (page 0)
        DataService.getFeeds(0, searchTerm)
            .then((data) => {

                // Set page to 0
                setPage(0);

                setFeeds(data);
            })
            .catch(errorMessage => console.log(errorMessage));
    };

    return (
        <div className='feeds-container'>

            <h1>Explore Feeds</h1>

            <form onSubmit={handleSearchSubmit}>
                <input
                    type='text'
                    className='form-control search-input mb-4 mt-4'
                    placeholder='Search feeds...'
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </form>

            {
                feeds.map((feed) => <FeedCard feed={feed} key={feed.id} />)
            }

            <div className='d-flex justify-content-center'>
                <Button className='custom-btn load-more-btn' onClick={handleLoadMore}>Load More</Button>
            </div>

        </div>
    )
}

export default Explore