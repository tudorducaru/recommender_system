import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/authContext';
import AuthService from '../../services/authService';
import DataService from '../../services/dataService';
import WordSelection from '../../components/wordSelection/wordSelection';
import Button from 'react-bootstrap/esm/Button';
import './settings.css';

const Settings = () => {

    // User's selected words
    const [selectedWords, setSelectedWords] = useState([]);;

    useEffect(() => {

        DataService.getUserWords()
            .then(words => setSelectedWords(words))
            .catch(error => console.log(error));

    }, []);

    // Access authentication context
    const authContext = useContext(AuthContext);

    const handleLogout = () => {

        // Make a request to log user out
        AuthService.logout()
            .then(() => authContext.logoutUser())
            .catch(errorMessage => console.log(errorMessage));

    }

    const handleWordClick = (word) => {

        if (selectedWords.includes(word)) {

            // Remove from selected words
            setSelectedWords(prevSelectedWords => {
                return prevSelectedWords.filter(element => element !== word);
            });
        } else {

            // Add to selected words
            setSelectedWords(prevSelectedWords => {
                return [...prevSelectedWords, word];
            });
        }

    }

    // Update user's words in the database
    const handleUpdateWords = () => {

        DataService.updateUserWords(selectedWords)
            .catch(error => console.log(error));

    }

    return  (
        <div className='settings-container d-flex flex-column align-items-center'>
            <h1>Update Your Preferences</h1>
            <WordSelection words={selectedWords} handleWordClick={handleWordClick} />
            <Button onClick={handleUpdateWords} id='confirm-update-words-btn' className='custom-btn mt-5 mb-3'>Confirm</Button>
            <Button id='logout-btn' className='custom-btn' onClick={handleLogout}>Logout</Button>
        </div>
    )
}

export default Settings;