import React from 'react';
import './about.css';

const About = () => {
    return (
        <div className='feeds-container'>
            <h1>About</h1>

            <div className='divider'></div>

            <p className='mt-3'>FeedSupply represents the third year project from the University of Warwick. The project has been built by Tudor Ducaru, supervised by Dr. Fayyaz Minhas.</p>

            <p>If you are interested in the project or have any interesting suggestions, please do not hesitate to reach out!</p>

            <p className='m-0'><b>Tudor Ducaru</b> (tudor.ducaru@warwick.ac.uk)</p>
            <p className='m-0'><b>Dr. Fayyaz Minhas</b> (fayyaz.minhas@warwick.ac.uk)</p>
        </div>
    );
};

export default About;