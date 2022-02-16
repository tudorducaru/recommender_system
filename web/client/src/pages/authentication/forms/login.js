import React, { useState } from 'react';
import { Formik, Field } from 'formik';
import * as yup from 'yup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';


const LoginForm = () => {

    // Keep track of errors
    const [serverError, setServerError] = useState();

    return (
        <div>
            <Formik
                initialValues={{
                    email: '',
                    password: ''
                }}
                validationSchema={yup.object({
                    email: yup.string()
                        .email('Email address is not valid')
                        .required('Please enter an email'),
                    password: yup.string()
                        .min(6, 'Password must have at least 6 characters')
                        .required('Please enter a password')
                })}
                validateOnChange={false}
                validateOnBlur={false}
                onSubmit={(values, { setSubmitting }) => {

                    

                }}
            >
                {({
                    isSubmitting,
                    handleSubmit,
                    errors
                }) => (
                    <Form onSubmit={handleSubmit}>

                        {serverError && <Alert variant='danger'>{serverError}</Alert>}

                        {isSubmitting && <Spinner className='custom-spinner' animation='border' />}

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
                        <Button className='custom-button' variant="primary" type="submit" disabled={isSubmitting}>
                            Log In
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    )
};

export default LoginForm;