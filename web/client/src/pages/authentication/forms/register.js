import React, { useState, useContext } from 'react';
import { Formik, Field } from 'formik';
import * as yup from 'yup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import WordSelection from '../../../components/wordSelection/wordSelection';
import AuthService from '../../../services/authService';
import { AuthContext } from '../../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

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
                <Form className='authentication-form p-3' onSubmit={handleSubmit}>
                    <Form.Group className='form-group mb-3'>
                        <Form.Label>Email</Form.Label>
                        <Field
                            type='text'
                            name='email'
                            isInvalid={!!errors.email}
                            placeholder='Please insert your email...'
                            as={Form.Control}
                        />
                        <Form.Control.Feedback type='invalid'>
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='form-group mb-3'>
                        <Form.Label>Password</Form.Label>
                        <Field
                            type='password'
                            name='password'
                            isInvalid={!!errors.password}
                            placeholder='Please insert a password...'
                            as={Form.Control} />
                        <Form.Control.Feedback type='invalid'>
                            {errors.password}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className='form-group mb-2'>
                        <Form.Label>Confirm Password</Form.Label>
                        <Field
                            type='password'
                            name='passwordConfirm'
                            isInvalid={!!errors.passwordConfirm}
                            placeholder='Please repeat your password...'
                            as={Form.Control} />
                        <Form.Control.Feedback type='invalid'>
                            {errors.passwordConfirm}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button className='custom-btn mt-5' variant="primary" type="submit" disabled={isSubmitting}>
                        Next Step
                    </Button>
                </Form>
            )}
        </Formik>
    );
};

const RegistrationForm = () => {

    const [serverError, setServerError] = useState();
    const [isSubmitting, setIsSubmitting] = useState();

    // Access authentication context
    const authContext = useContext(AuthContext);

    // Access navigation
    const navigate = useNavigate();

    // User info
    const [userInfo, setUserInfo] = useState({
        'email': '',
        'password': '',
        'words': []
    });

    // Whether to show word selection component or not
    const [showWordSelection, setShowWordSelection] = useState(false);

    const handleInfoSubmit = (values) => {
        setUserInfo(prevUserInfo => {
            prevUserInfo.email = values.email;
            prevUserInfo.password = values.password;

            return prevUserInfo;
        });

        setServerError();
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

        // Show spinner 
        setIsSubmitting(true);

        AuthService.register(userInfo)
            .then(() => {

                // Store that the user is logged in
                authContext.loginUser();

                // Navigate to homepage
                navigate('/', { replace: true });

            })
            .catch(errorMessage => {

                // Go back to user info step
                setIsSubmitting(false);
                setShowWordSelection(false);

                // Show error message
                setServerError(errorMessage);
            });

    }

    return (
        <div>

            {serverError && <Alert variant='danger'>{serverError}</Alert>}

            {
                !showWordSelection ?
                    <UserInfoForm
                        initialValues={userInfo}
                        handleSubmit={handleInfoSubmit}
                    /> :
                    <div className='registration-step-2-container'>

                        {isSubmitting && <Spinner className='custom-spinner' animation='border' />}

                        <WordSelection
                            words={userInfo.words}
                            handleWordClick={handleWordClick}
                        />
                        <Button className='custom-btn mt-5 mb-3' onClick={handleSubmit}>Confirm</Button>
                        <Button className='custom-btn' id='go-back-btn' onClick={() => setShowWordSelection(false)}>Go back</Button>
                    </div>
            }


        </div>
    )
}

export default RegistrationForm;