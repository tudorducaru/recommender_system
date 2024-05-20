import React, { useContext } from 'react';
import './feedCard.css';
import { useNavigate } from 'react-router-dom';
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
    const handleLike = (e) => {
        e.stopPropagation();

        addLikedFeed(feed);

        DataService.likeFeed(feed.id)
            .catch(errorMessage => console.log(errorMessage));

    }

    // Handle disliking a feed
    const handleDislike = (e) => {
        e.stopPropagation();

        removeLikedFeed(feed.id);

        DataService.dislikeFeed(feed.id)
            .catch(errorMessage => console.log(errorMessage));

    }

    // Use navigation
    const navigate = useNavigate();

    return (
        <Container onClick={() => navigate(`/feed/${feed.id}`)} className='feed-card mt-3 mb-4 px-4 py-4 align-items-center' key={feed.id} fluid>
            <Row>
                <Col>
                    <p className='feed-card-title'>
                        {feed.title}
                    </p>
                    <div className='feed-card-description mb-0'>
                        {feed.description}
                    </div>
                </Col>
                <Col className='col-auto d-flex align-items-center'>

                    {/* Show appropriate icon according to prop */}
                    {
                        checkLiked() ? 
                            <AiFillStar className='like-icon' onClick={handleDislike} size={24} /> :
                            <AiOutlineStar className='like-icon' onClick={handleLike} size={24} />
                    }
                    
                </Col>
            </Row>

        </Container>
    )
};

export default FeedCard;