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

                const newWords = prevSelectedWords.filter(element => element !== word);

                // Update words in the database
                DataService.updateUserWords(newWords)
                    .catch(error => console.log(error));

                return newWords;
            });
        } else {

            // Add to selected words
            setSelectedWords(prevSelectedWords => {

                // Update words in the database
                DataService.updateUserWords([...prevSelectedWords, word])
                    .catch(error => console.log(error));

                return [...prevSelectedWords, word];
            });
        }



    }

    return (
        <div className='settings-container d-flex flex-column align-items-center'>
            <h1>Update Your Preferences</h1>
            <div className='divider mb-4'></div>
            <WordSelection words={selectedWords} handleWordClick={handleWordClick} />
            <Button id='logout-btn' className='custom-btn mt-5' onClick={handleLogout}>Logout</Button>
        </div>
    )
}

export default Settings;