import React, { useContext } from 'react'
import { AuthContext } from '../../contexts/authContext';
import FeedCard from '../../components/feedCard/feedCard';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const LikedFeeds = () => {

    // Access liked feeds from auth context
    const { likedFeeds } = useContext(AuthContext);

    return (
        <div className='feeds-container'>

            <h1>Liked Feeds</h1>

            <div className='divider'></div>

            <Container className='p-0 mt-4' fluid>
                {
                    likedFeeds.map((feed) => {
                        return <Row><Col>
                            <FeedCard feed={feed} key={feed.id} />
                        </Col></Row>
                    })
                }
            </Container>

        </div>
    )
}

export default LikedFeeds;