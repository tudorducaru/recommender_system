import React, { useContext } from 'react';
import './feedCard.css';
import { AiOutlineStar } from 'react-icons/ai';
import { AiFillStar } from 'react-icons/ai';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { AuthContext } from '../../contexts/authContext';
import DataService from '../../services/dataService';

const FeedCard = props => {

    // Connect to auth context to access liked feeds
    const { likedFeeds, addLikedFeed, removeLikedFeed } = useContext(AuthContext);

    // Get the feed from the props
    const feed = props.feed;

    // Helper function that checks if the current feed is liked
    const checkLiked = () => {
        return likedFeeds.filter(element => element.id === feed.id).length > 0;
    }

    // Handle liking a feed
    const handleLike = () => {

        addLikedFeed(feed);

        DataService.likeFeed(feed.id)
            .catch(errorMessage => console.log(errorMessage));

    }

    // Handle disliking a feed
    const handleDislike = () => {
        
        removeLikedFeed(feed.id);

        DataService.dislikeFeed(feed.id)
            .catch(errorMessage => console.log(errorMessage));

    }

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
                        checkLiked() ? 
                            <AiFillStar onClick={handleDislike} size={32} /> :
                            <AiOutlineStar onClick={handleLike} size={32} />
                    }
                    
                </Col>
            </Row>

        </Container>
    )
};

export default FeedCard;