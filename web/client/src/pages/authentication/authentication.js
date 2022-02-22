import React, { useState } from 'react';
import './authentication.css';
import LoginForm from './forms/login';
import RegistrationForm from './forms/register';

const Authentication = () => {

    // Whether to show login or registration form
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className='authentication-container mt-3'>
            <h1 className='mb-5'>Authenticate</h1>
            
            {
                showLogin ? <LoginForm /> : <RegistrationForm />
            }

            <p className='auth-toggle mt-3' onClick={() => setShowLogin(!showLogin)}>{ showLogin ? 'Do not have an account? Register!' : 'Log in' }</p>

        </div>
    )
}

export default Authentication;