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

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
            { props.children }
        </AuthContext.Provider>
    );

}