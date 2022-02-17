import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage/homepage';
import Authentication from './pages/authentication/authentication'
import Explore from './pages/explore/explore';
import RequireAuth from './components/requireAuth';
import { useEffect, useContext, useState } from 'react';
import { AuthContext } from './contexts/authContext';
import AuthService from './services/authService';
import Settings from './pages/settings/settings';
import axios from 'axios';
import Cookies from 'js-cookie';
import DataService from './services/dataService';

function App() {

    // Configure axios to send credentials with every request
    axios.defaults.withCredentials = true;

    // Configure axios to include csrf token as header in all requests
    axios.defaults.headers.common['X-CSRF-Token'] = Cookies.get('csrf_access_token');

    // Wait for server response about user login info
    const [verification, setVerification] = useState(false);

    // Access authentication context
    const authContext = useContext(AuthContext);

    // Verify that the user is logged in
    useEffect(() => {

        AuthService.verifyUser()
            .then(user => {
                
                // Store login information in context
                if (user) {

                    // Get the feeds liked by the user
                    return DataService.getLikedFeeds()
                        .then(feeds => {

                            // Login user
                            authContext.loginUser();

                            // Store liked feeds in global state
                            authContext.setLikedFeeds(feeds);

                        })
                        .catch(errorMessage => console.log(errorMessage));
                    
                }
                else authContext.logoutUser();

            })
            .then(() => setVerification(true));    

    }, [])

    return !verification ? <div></div> : (
        <Routes>
            <Route path='/authentication' element={<Authentication />} />
            <Route path='/' element={<RequireAuth><Homepage /></RequireAuth>} />
            <Route path='/explore' element={<RequireAuth><Explore /></RequireAuth>} />
            <Route path='/settings' element={<RequireAuth><Settings /></RequireAuth>} />
        </Routes>
    );
}

export default App;
