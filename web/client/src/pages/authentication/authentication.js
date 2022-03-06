import React, { useState } from 'react';
import './authentication.css';
import LoginForm from './forms/login';
import RegistrationForm from './forms/register';
import logo from '../../logo_auth.png';

const Authentication = () => {

    // Whether to show login or registration form
    const [showLogin, setShowLogin] = useState(true);

    return (
        <div>
            <div className='authentication-background'></div>
            <div className='authentication-container mt-3'>

                <img className='brand-image' src={logo} ></img>

                <h1 className='mb-5 brand-name'>FeedSupply</h1>

                {
                    showLogin ? <LoginForm /> : <RegistrationForm />
                }

                <p className='auth-toggle mt-3' onClick={() => setShowLogin(!showLogin)}>{showLogin ? 'Do not have an account? Register!' : 'Log in'}</p>

            </div>
        </div>

    )
}

export default Authentication;