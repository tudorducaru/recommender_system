import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DataService from '../../services/dataService';
import Spinner from 'react-bootstrap/Spinner';
import './feedPage.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FeedEntryCard from '../../components/feedEntryCard/feedEntryCard';
import FeedCard from '../../components/feedCard/feedCard';

const FeedPage = () => {

    const [feed, setFeed] = useState();
    const [similarFeeds, setSimilarFeeds] = useState();

    // Get the id of the feed
    let params = useParams();
    const feedID = params.feedID;

    // Get the contents of the feed
    useEffect(async () => {

        // Get the feed 
        DataService.parseFeed(feedID)
            .then(f => setFeed(f))
            .catch(errorMessage => console.log(errorMessage));

        // Get similar feeds
        DataService.getSimilarFeeds(feedID)
            .then(sf => setSimilarFeeds(sf))
            .catch(errorMessage => console.log(errorMessage));

    }, []);

    return (

        <div className='feed-page-container'>

            {(!feed || !similarFeeds) ? <Spinner className='custom-spinner' animation='border' /> :

                (
                    <div>
                        <h1>{feed.feed.title}</h1>
                        <p>{feed.feed.subtitle}</p>

                        <div className='divider'></div>

                        <Container className='p-0' fluid>

                            <Row>

                                {
                                    feed.entries.map(entry => {
                                        return <Col className='col-12 col-sm-6 col-md-4'>
                                            <FeedEntryCard entry={entry} key={entry.link} />
                                        </Col>;
                                    })
                                }

                            </Row>

                        </Container>

                        <h2>Similar Feeds</h2>

                        <div className='divider'></div>

                        <Container className='p-0' fluid>

                            {
                                similarFeeds.map(feed => {
                                    return <Row><Col>
                                        <FeedCard feed={feed} key={feed.id} />
                                    </Col></Row>;
                                })
                            }

                        </Container>

                    </div>
                )

            }

        </div>

    )
};

export default FeedPage;