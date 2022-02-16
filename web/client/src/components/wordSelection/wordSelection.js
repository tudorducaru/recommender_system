import React, { useEffect, useState } from 'react';
import './wordSelection.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DataService from '../../services/dataService';

const WordSelection = props => {

    const [words, setWords] = useState([]);

    useEffect(() => {

        DataService.getWords()
            .then((data) => setWords(data.words))
            .catch(errorMessage => console.log(errorMessage));

    }, []);

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