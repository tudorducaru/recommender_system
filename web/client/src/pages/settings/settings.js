import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/authContext';
import AuthService from '../../services/authService';

const Settings = () => {

    // Access authentication context
    const authContext = useContext(AuthContext);

    const handleLogout = () => {

        // Make a request to log user out
        AuthService.logout()
            .then(() => authContext.logoutUser())
            .catch(errorMessage => console.log(errorMessage));

    }

    return (
        <button onClick={handleLogout}>Logout</button>
    )
}

export default Settings;