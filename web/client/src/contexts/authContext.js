import React, { useState } from 'react';

// Create a new context
export const AuthContext = React.createContext();

export const AuthProvider = props => {

    // Keep the user in the provider's state
    const [user, setUser] = useState();

    // Store that the user is logged in
    const loginUser = () => setUser(true);

    // Store that the user is logged out
    const logoutUser = () => setUser(false);

    // Keep user's liked feeds in the provider's state
    const [likedFeeds, setLikedFeeds] = useState();

    // Add liked feed to global state
    const addLikedFeed = feed => {
        setLikedFeeds([...likedFeeds, feed])
    };

    // Remove liked feed from global state
    const removeLikedFeed = feed_id => {
        setLikedFeeds(prevLikedFeeds => {
            return prevLikedFeeds.filter(feed => feed.id !== feed_id)
        })
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser, likedFeeds, setLikedFeeds, addLikedFeed, removeLikedFeed }}>
            { props.children }
        </AuthContext.Provider>
    );

}