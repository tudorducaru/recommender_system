import React, { useContext } from 'react';
import './homepage.css';
import { AuthContext } from '../../contexts/authContext';

const Homepage = () => {

    const context = useContext(AuthContext);

    return (
        <div>Homepage</div>
    )
}

export default Homepage;