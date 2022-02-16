import React, { useContext } from 'react';
import { AuthContext } from '../contexts/authContext';
import { Navigate } from 'react-router-dom';

const RequireAuth = props => {

    // Get the user from AuthContext
    const authContext = useContext(AuthContext);

    // Navigate to the authentication page if the user is not logged in
    if (!authContext.user) return <Navigate to='/authentication' replace={true}/>
    else return props.children;
};

export default RequireAuth;