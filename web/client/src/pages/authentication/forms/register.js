import React, { useState } from 'react';
import { Formik, Field } from 'formik';
import * as yup from 'yup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import WordSelection from '../../../components/wordSelection/wordSelection';

const UserInfoForm = props => {

    return (
        <Formik
            initialValues={{
                ...props.initialValues,
                'passwordConfirm': props.initialValues.password
            }}
            validationSchema={yup.object({
                email: yup.string()
                    .email('Email address is not valid')
                    .required('Please enter an email'),
                password: yup.string()
                    .min(6, 'Password must have at least 6 characters')
                    .required('Please enter a password'),
                passwordConfirm: yup.string()
                    .min(6, 'Password must have at least 6 characters')
                    .required('Please enter a password')
                    .equals([yup.ref('password')], 'Passwords must match'),
            })}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={(values) => {

                props.handleSubmit(values);

            }}
        >
            {({
                isSubmitting,
                handleSubmit,
                errors
            }) => (
                <Form onSubmit={handleSubmit}>
                    <Form.Group className='form-group'>
                        <Form.Label>Email</Form.Label>
                        <Field
                            type='text'
                            name='email'
                            isInvalid={!!errors.email}
                            as={Form.Control}
                        />
                        <Form.Control.Feedback type='invalid'>
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='form-group'>
                        <Form.Label>Password</Form.Label>
                        <Field
                            type='password'
                            name='password'
                            isInvalid={!!errors.password}
                            as={Form.Control} />
                        <Form.Control.Feedback type='invalid'>
                            {errors.password}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='form-group'>
                        <Form.Label>Confirm Password</Form.Label>
                        <Field
                            type='password'
                            name='passwordConfirm'
                            isInvalid={!!errors.passwordConfirm}
                            as={Form.Control} />
                        <Form.Control.Feedback type='invalid'>
                            {errors.passwordConfirm}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button className='custom-button' variant="primary" type="submit" disabled={isSubmitting}>
                        Next Step
                    </Button>
                </Form>
            )}
        </Formik>
    );
};

const RegistrationForm = () => {

    // User info
    const [userInfo, setUserInfo] = useState({
        'email': '',
        'password': '',
        'words': []
    });

    // Keep track of errors
    const [serverError, setServerError] = useState();

    // Whether to show word selection component or not
    const [showWordSelection, setShowWordSelection] = useState(false);

    const handleInfoSubmit = (values) => {
        setUserInfo(prevUserInfo => {
            prevUserInfo.email = values.email;
            prevUserInfo.password = values.password;

            return prevUserInfo;
        });
        setShowWordSelection(true);
    }

    const handleWordClick = (word) => {

        if (userInfo.words.includes(word)) {

            // Remove from selected words
            setUserInfo(prevUserInfo => {
                let newWords = prevUserInfo.words.filter(element => element !== word);
                return {
                    ...prevUserInfo,
                    'words': newWords
                }
            });

        } else {

            // Add to selected words
            setUserInfo(prevUserInfo => {
                let newWords = [...prevUserInfo.words, word];
                return {
                    ...prevUserInfo,
                    'words': newWords
                }
            });

        }

    }

    const handleSubmit = () => {
        console.log(userInfo);
    }

    return (
        <div>
            {
                !showWordSelection ?
                    <UserInfoForm
                        initialValues={userInfo}
                        handleSubmit={handleInfoSubmit}
                    /> :
                    <div>
                        <WordSelection
                            words={userInfo.words}
                            handleWordClick={handleWordClick}
                        />
                        <Button onClick={() => setShowWordSelection(false)}>Go back</Button>
                        <Button className='ms-3' onClick={handleSubmit}>Confirm</Button>
                    </div>
            }


        </div>
    )
}

export default RegistrationForm;