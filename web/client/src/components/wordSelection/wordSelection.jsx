import React, { useEffect, useState } from 'react';
import './wordSelection.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DataService from '../../services/dataService';
import Spinner from 'react-bootstrap/Spinner';

const WordSelection = props => {

    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        setLoading(true);

        DataService.getWords()
            .then((data) => setWords(data.words))
            .catch(errorMessage => console.log(errorMessage))
            .finally(() => setLoading(false));

    }, []);

    return (
        <Container className='word-selection-container position-relative' fluid>
            <Row className='justify-content-center'>

                {loading && <Spinner className='custom-spinner' animation='border' />}

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