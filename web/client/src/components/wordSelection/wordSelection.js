import React, { useState } from 'react';
import './wordSelection.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

const WordSelection = props => {

    let words = ['Hatz', 'Jonule', 'Tudor', 'Boss', 'Unchiule', 'Godac', 'Manele', 'Masini', 'Bani'];

    return (
        <Container fluid>
            <Row className='justify-content-center'>

                {
                    words.map(word => {

                        let selectedClass = '';
                        if (props.words.includes(word)) selectedClass = 'selected'

                        return <Col className={`word col-auto ${selectedClass}`} onClick={() => props.handleWordClick(word)}>{word}</Col>
                    })
                }

            </Row>
        </Container>
    )
}

export default WordSelection;