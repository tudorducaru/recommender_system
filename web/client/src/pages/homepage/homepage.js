import React, { useState, useEffect } from 'react';
import './homepage.css';
import FeedCard from '../../components/feedCard/feedCard';
import DataService from '../../services/dataService';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

const Homepage = () => {

    const [loading, setLoading] = useState(false);

    // Store recommended feeds in local state
    const [recommendedFeeds, setRecommendedFeeds] = useState([]);

    // Whether recommendations should be made based on corex or tfidf
    const [corex, setCorex] = useState(false);

    // Load recommended feeds
    useEffect(() => {

        setLoading(true);

        if (corex) {

            // Recommend feeds based on corex
            DataService.getRecommendedFeedsCorex()
                .then((data) => setRecommendedFeeds(data))
                .catch(errorMessage => console.log(errorMessage))
                .finally(() => setLoading(false));

        } else {

            // Recommend feeds based on tfidf
            DataService.getRecommendedFeedsTfIdf()
                .then((data) => setRecommendedFeeds(data))
                .catch(errorMessage => console.log(errorMessage))
                .finally(() => setLoading(false));

        }


    }, [corex]);

    return (
        <div className='feeds-container'>

            <h1>Recommended Feeds</h1>

            {loading && <Spinner className='custom-spinner' animation='border' />}

            <Form.Check
                type='switch'
                label='Recommend feeds based on CorEx topics'
                className='mb-3'
                checked={corex}
                onChange={(e) => setCorex(!corex)}
            />

            {
                recommendedFeeds.map((feed) => <FeedCard feed={feed} key={feed.id} />)
            }

        </div>
    )
}

export default Homepage;