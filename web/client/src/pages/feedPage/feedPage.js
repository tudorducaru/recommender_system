import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DataService from '../../services/dataService';
import Spinner from 'react-bootstrap/Spinner';
import './feedPage.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FeedEntryCard from '../../components/feedEntryCard/feedEntryCard';

const FeedPage = () => {

    const [feed, setFeed] = useState();

    // Get the id of the feed
    let params = useParams();
    const feedID = params.feedID;

    // Get the contents of the feed
    useEffect(async () => {

        // Get feed URL
        const f = await DataService.parseFeed(feedID);
        setFeed(f);

    }, []);

    return (

        <div className='feed-page-container'>

            {!feed ? <Spinner className='custom-spinner' animation='border' /> :

                (
                    <div>
                        <h1>{feed.feed.title}</h1>
                        <p>{feed.feed.subtitle}</p>

                        <div className='divider'></div>

                        <Container className='p-0' fluid>

                            <Row>

                                {
                                    feed.entries.map(entry => {
                                        console.log(entry);
                                        return <Col className='col-12 col-sm-6 col-md-4'>
                                            <FeedEntryCard entry={entry} />
                                        </Col>;
                                    })
                                }

                            </Row>

                        </Container>

                    </div>
                )

            }

        </div>

    )
};

export default FeedPage;