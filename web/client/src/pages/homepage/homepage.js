import React, { useState, useEffect } from 'react';
import './homepage.css';
import FeedCard from '../../components/feedCard/feedCard';
import DataService from '../../services/dataService';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const Homepage = () => {

    const [loading, setLoading] = useState(false);

    // Store recommended feeds in local state
    const [recommendedFeeds, setRecommendedFeeds] = useState([]);

    // Whether recommendations should be made based on corex or tfidf
    const [corex, setCorex] = useState(false);

    // Keep track of the current page
    const [page, setPage] = useState(0);

    // Load recommended feeds
    useEffect(() => {

        setLoading(true);

        if (corex) {

            // Recommend feeds based on corex
            DataService.getRecommendedFeedsCorex(page)
                .then((data) => setRecommendedFeeds(data))
                .catch(errorMessage => console.log(errorMessage))
                .finally(() => setLoading(false));

        } else {

            // Recommend feeds based on tfidf
            DataService.getRecommendedFeedsTfIdf(page)
                .then((data) => setRecommendedFeeds(data))
                .catch(errorMessage => console.log(errorMessage))
                .finally(() => setLoading(false));

        }


    }, [corex]);

    // Handle loading more data
    const handleLoadMore = () => {

        // Increment page number
        setPage(prevPage => prevPage++);

        if (corex) {

            // Recommend feeds based on corex
            DataService.getRecommendedFeedsCorex(page + 1)
                .then((data) => {

                    // Increment the page
                    setPage(prevPage => prevPage + 1);

                    setRecommendedFeeds([...recommendedFeeds, ...data]);
                })
                .catch(errorMessage => console.log(errorMessage));

        } else {

            // Recommend feeds based on tfidf
            DataService.getRecommendedFeedsTfIdf(page + 1)
                .then((data) => {

                    // Increment the page
                    setPage(prevPage => prevPage + 1);

                    setRecommendedFeeds([...recommendedFeeds, ...data]);
                })
                .catch(errorMessage => console.log(errorMessage));
        }
    };

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

            <div className='divider'></div>

            <Container className='p-0 mt-4' fluid>
                {
                    recommendedFeeds.map((feed) => {
                        return <Row><Col>
                            <FeedCard feed={feed} key={feed.id} />
                        </Col></Row>
                    })
                }
            </Container>

            {
                !loading &&
                <div className='d-flex justify-content-center'>
                    <Button className='custom-btn load-more-btn' onClick={handleLoadMore}>Load More</Button>
                </div>
            }

        </div>
    )
}

export default Homepage;