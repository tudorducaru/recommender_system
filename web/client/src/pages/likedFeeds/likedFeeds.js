import React, { useContext } from 'react'
import { AuthContext } from '../../contexts/authContext';
import FeedCard from '../../components/feedCard/feedCard';

const LikedFeeds = () => {

    // Access liked feeds from auth context
    const { likedFeeds } = useContext(AuthContext);

    return (
        <div className='feeds-container'>

            <h1>Liked Feeds</h1>

            {
                likedFeeds.map((feed) => <FeedCard feed={feed} key={feed.id} />)
            }

        </div>
    )
}

export default LikedFeeds;