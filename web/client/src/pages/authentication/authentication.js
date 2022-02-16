import React, { useState } from 'react';
import './authentication.css';
import LoginForm from './forms/login';
import RegistrationForm from './forms/register';

const Authentication = () => {

    // Whether to show login or registration form
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div className='authentication-container'>
            <h1>Authenticate</h1>
            
            {
                showLogin ? <LoginForm /> : <RegistrationForm />
            }

            <p className='auth-toggle' onClick={() => setShowLogin(!showLogin)}>{ showLogin ? 'Do not have an account? Register!' : 'Log in' }</p>

        </div>
    )
}

export default Authentication;