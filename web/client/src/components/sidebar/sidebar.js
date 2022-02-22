import React, { useState } from 'react';
import './sidebar.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { AiOutlineClose } from 'react-icons/ai';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Link } from 'react-router-dom'

const Sidebar = () => {

    // Whether or not to show the sidebar
    const [show, setShow] = useState(true);
    console.log(show);

    return (
        <div className={'sidebar-container ' + (show ? 'show' : '')}>
            <Container className='sidebar'>
                
                {/* Close sidebar button */}
                <Row className='justify-content-end'>
                    <Col className='col-auto'>
                        <AiOutlineClose onClick={() => setShow(false)} size={16} />
                    </Col>
                </Row>

                {/* Links to pages */}
                <Row>
                    <Col>
                        <Link to='/'>
                            Recommended For You
                        </Link>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Link to='/explore'>
                            Explore
                        </Link>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Link to='/likedFeeds'>
                            Liked Feeds
                        </Link>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Link to='/settings'>
                            Settings
                        </Link>
                    </Col>
                </Row>



            </Container>

            {/* Open sidebar button */}
            <GiHamburgerMenu
                className='sidebar-hamburger-icon'
                onClick={() => setShow(true)}
                size={32}
            />
        </div>
    );
};

export default Sidebar;