import React from 'react';
import './feedCard.css';
import { AiOutlineStar } from 'react-icons/ai';
import { AiFillStar } from 'react-icons/ai';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const FeedCard = props => {

    // Get the feed from the props
    const feed = props.feed;

    return (
        <Container className='feed-card mb-3 px-3 py-2 align-items-center' key={feed.id} fluid>
            <Row>
                <Col>
                    <p className='feed-card-title'>
                        {feed.title}
                    </p>
                    <p className='feed-card-description mb-0'>
                        {feed.description}
                    </p>
                </Col>
                <Col className='col-auto d-flex align-items-center'>

                    {/* Show appropriate icon according to prop */}
                    {
                        props.selected ? 
                            <AiFillStar size={32} /> :
                            <AiOutlineStar size={32} />
                    }
                    
                </Col>
            </Row>

        </Container>
    )
};

export default FeedCard;