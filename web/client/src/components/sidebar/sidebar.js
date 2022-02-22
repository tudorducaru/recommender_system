import React, { useState } from 'react';
import './sidebar.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { AiOutlineClose } from 'react-icons/ai';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Link } from 'react-router-dom';

const Sidebar = () => {

    // Get the current location of the user
    const location = window.location.pathname;

    // Whether or not to show the sidebar
    const [show, setShow] = useState(false);
    console.log(show);

    return (
        <div className={'sidebar-container ' + (show ? 'show' : '')}>
            <Container className='sidebar d-flex flex-column justify-content-between'>

                {/* Close sidebar button */}
                <Row className='justify-content-end'>
                    <Col className='col-auto'>
                        <AiOutlineClose
                            className='sidebar-close'
                            onClick={() => setShow(false)}
                            size={16}
                        />
                    </Col>
                </Row>

                <Row className='justify-content-center'>
                    {/* Links to pages */}
                    <Row className={'sidebar-link ' + (location === '/' ? 'selected' : '')}>
                        <Col>
                            <Link to='/'>
                                Recommended For You
                            </Link>
                        </Col>
                    </Row>

                    <Row className={'sidebar-link ' + (location === '/explore' ? 'selected' : '')}>
                        <Col>
                            <Link to='/explore'>
                                Explore
                            </Link>
                        </Col>
                    </Row>

                    <Row className={'sidebar-link ' + (location === '/likedFeeds' ? 'selected' : '')}>
                        <Col>
                            <Link to='/likedFeeds'>
                                Liked Feeds
                            </Link>
                        </Col>
                    </Row>

                    <Row className={'sidebar-link ' + (location === '/settings' ? 'selected' : '')}>
                        <Col>
                            <Link to='/settings'>
                                Settings
                            </Link>
                        </Col>
                    </Row>
                </Row>

                <Row></Row>

            </Container>

            {/* Open sidebar button */}
            <div className='hamburger-container'>
                <GiHamburgerMenu
                    className='sidebar-hamburger-icon m-3'
                    onClick={() => setShow(true)}
                    size={32}
                />
            </div>

        </div>
    );
};

export default Sidebar;