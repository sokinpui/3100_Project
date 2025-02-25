import React from 'react'
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { user } from './testData';  // Importing user data from testData.js SHOULD DELETE AFTER HAVING API

export default function Signup() {

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        password: '',
        rePassword: ''
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSignup =(e) => {
        e.preventDefault();
        validateSignup();
    }

    const validatePassword = () => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
        return !passwordRegex.test(formData.password);
    }

    const validateSignup = () => {
        const errors = {};
        if (user.find(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
            errors.username = 'Username already exists';
        }
        if (/[`~!@#$%^&*()_.|+\-=?;:'",<>\{\}\[\]\\\/]/g.test(formData.username)) {
            errors.username2 = 'Username should not contain special characters';
        }
        if (formData.contactNumber.search(/^[0-9]{8}$/) === -1) {
            errors.contactNumber = 'Contact number must be 8 digits';
        }
        if (validatePassword()) {
            errors.password = 'Password must contain at least 8 characters, an upper-case letter, a lower-case letter, a number and a special symbol';
        }
        if (formData.password !== formData.rePassword) {
            errors.rePassword = 'Passwords do not match';
        }
        if (Object.keys(errors).length === 0) {
            alert('Signup successful, please check email for confirmation link');
            navigate('/login');
        } else {
            setErrors(errors);
            alert(Object.values(errors).join('\n\n'));
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      };

    return (
        <div className="signup-container">
            <div className="signup-content">
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        <form onSubmit={handleSignup} className="signup-form">
                            <div className="form-group">
                                <h2>SETA Signup Page</h2>
                                <label htmlFor="username">Username:</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="firstName">First Name:</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name:</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="contactNumber">Contact Number:</label>
                                <input
                                    type="text"
                                    id="contactNumber"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password:</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="rePassword">Re-Enter Password:</label>
                                <input
                                    type="password"
                                    id="rePassword"
                                    name="rePassword"
                                    value={formData.rePassword}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={isLoading}>
                                Signup
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
