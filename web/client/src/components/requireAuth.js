import React, { useContext } from 'react';
import { AuthContext } from '../contexts/authContext';
import { Navigate } from 'react-router-dom';
import Sidebar from './sidebar/sidebar';

const RequireAuth = props => {

    // Get the user from AuthContext
    const authContext = useContext(AuthContext);

    // Navigate to the authentication page if the user is not logged in
    if (!authContext.user) return <Navigate to='/authentication' replace={true} />
    else return (
        <main className='d-flex'>

            {/* Include sidebar */}
            <Sidebar />
            <div className='main-content d-flex justify-content-center'>
                {props.children}
            </div>
        </main>
    );
};

export default RequireAuth;