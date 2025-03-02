import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Container,
  InputAdornment,
  Alert,
  IconButton,
  Avatar,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  AccountCircle,
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  HowToReg
} from '@mui/icons-material';

// Backend API URL for authentication endpoints, currently hardcoded
const API_URL = 'http://localhost:8000';

export default function Signup() {
    // State management for the signup form
    const [isLoading, setIsLoading] = useState(false); // Controls loading state during API calls
    const [formData, setFormData] = useState({
        // Form fields matching the FastAPI schema requirements
        username: '',
        first_name: '', 
        last_name: '',
        email: '',
        contact_number: '',
        password: '',
        rePassword: '' // Used for password confirmation (not sent to API)
    });
    const [errors, setErrors] = useState({}); // Tracks validation errors for each field
    const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
    const [showRePassword, setShowRePassword] = useState(false); // Toggle confirm password visibility
    const navigate = useNavigate(); // For navigation after form submission

    /**
     * Handles the form submission process
     * 1. Prevents default form submission
     * 2. Validates form data
     * 3. Submits data to the API if validation passes
     * 4. Handles success/error responses
     */
    const handleSignup = async (e) => {
        e.preventDefault();
        
        // Client-side validation before API call
        const validationErrors = validateForm();
        
        // If any validation errors exist, display them and stop submission
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        // Start loading state
        setIsLoading(true);
        
        try {
            // Prepare payload for API - matches the UserCreate Pydantic model
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                first_name: formData.first_name,
                last_name: formData.last_name,
                contact_number: formData.contact_number
            };
            
            // Send POST request to signup endpoint
            await axios.post(`${API_URL}/signup`, userData);
            
            // Handle successful signup - redirect to login page with success message
            setIsLoading(false);
            navigate('/login', { state: { message: 'Signup successful! Please log in.' } });
            
        } catch (error) {
            // Stop loading state
            setIsLoading(false);
            
            // Comprehensive error handling based on API response
            if (error.response) {
                // API responded with an error status code
                if (error.response.status === 400 && error.response.data.detail.includes('Username already registered')) {
                    // Handle specific case: username already exists
                    setErrors({ username: 'Username already exists' });
                } else {
                    // Handle API error with message from backend
                    setErrors({ general: error.response.data.detail || 'Signup failed. Please try again.' });
                }
            } else if (error.request) {
                // Request was sent but no response received
                setErrors({ general: 'Server not responding. Please try again later.' });
            } else {
                // Error in request setup
                setErrors({ general: 'An error occurred during signup' });
            }
            
            console.error('Signup error:', error);
        }
    };

    /**
     * Validates password complexity requirements
     * @returns {boolean} true if password fails validation
     */
    const validatePassword = () => {
        // Regex checks for:
        // - At least 8 characters
        // - At least 1 lowercase letter
        // - At least 1 uppercase letter
        // - At least 1 number
        // - At least 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
        return !passwordRegex.test(formData.password);
    };

    /**
     * Comprehensive form validation for all fields
     * Returns validation errors for each field as an object
     */
    const validateForm = () => {
        const validationErrors = {}; // Renamed from 'errors' to 'validationErrors'
        
        // Username validation - no special characters allowed
        if (/[`~!@#$%^&*()_.|+\-=?;:'",<>\{\}\[\]\\\/]/g.test(formData.username)) {
            validationErrors.username = 'Username should not contain special characters';
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            validationErrors.email = 'Please enter a valid email address';
        }
        
        // Contact number validation - must be exactly 8 digits
        if (formData.contact_number.search(/^[0-9]{8}$/) === -1) {
            validationErrors.contact_number = 'Contact number must be 8 digits';
        }
        
        // Password complexity validation
        if (validatePassword()) {
            validationErrors.password = 'Password must contain at least 8 characters, an upper-case letter, a lower-case letter, a number and a special symbol';
        }
        
        // Password match validation
        if (formData.password !== formData.rePassword) {
            validationErrors.rePassword = 'Passwords do not match';
        }
        
        // Required fields validation - ensure all fields have values
        if (!formData.username) validationErrors.username = 'Username is required';
        if (!formData.first_name) validationErrors.first_name = 'First name is required';
        if (!formData.last_name) validationErrors.last_name = 'Last name is required';
        if (!formData.email) validationErrors.email = 'Email is required';
        if (!formData.contact_number) validationErrors.contact_number = 'Contact number is required';
        if (!formData.password) validationErrors.password = 'Password is required';
        if (!formData.rePassword) validationErrors.rePassword = 'Please confirm your password';
        
        return validationErrors;
    };

    /**
     * Updates form data state when input values change
     * Also clears related error messages when a field is edited
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this specific field when user starts typing again
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    /**
     * Toggles password visibility for better user experience
     * field = 'password' or 'rePassword' to determine which field to toggle
     */
    const handleTogglePassword = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowRePassword(!showRePassword);
        }
    };

    // Component rendering - UI for signup form
    return (
        // Container wraps the entire form with proper spacing and centering
        <Container maxWidth="sm" sx={{ 
            my: 8,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            {/* Paper component gives the form a card-like appearance */}
            <Paper 
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    borderRadius: 2,
                    backgroundColor: '#f8f9fa'
                }}
            >
                {/* Header section with icon and title */}
                <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 3
                }}>
                    <Avatar sx={{ 
                        m: 1, 
                        bgcolor: 'primary.main',
                        width: 56,
                        height: 56
                    }}>
                        <HowToReg fontSize="large" />
                    </Avatar>
                    <Typography 
                        component="h1" 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 'bold',
                            color: 'primary.main',
                            letterSpacing: '1px',
                            mt: 1
                        }}
                    >
                        SETA Signup
                    </Typography>
                    <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Create your account to get started
                    </Typography>
                </Box>

                {/* General error alert - displays API errors */}
                {errors.general && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 1 }}
                    >
                        {errors.general}
                    </Alert>
                )}

                {/* Validation errors alert - displays when form has field-specific errors */}
                {Object.values(errors).some(error => error) && !errors.general && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 1 }}
                    >
                        Please correct the errors in the form
                    </Alert>
                )}

                {/* Main form */}
                <Box component="form" onSubmit={handleSignup} noValidate>
                    <Grid container spacing={2}>
                        {/* Username field */}
                        <Grid size={12}>
                            <TextField
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                error={!!errors.username}
                                helperText={errors.username}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountCircle color="action" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>
                        
                        {/* First and last name fields in one row */}
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                required
                                fullWidth
                                id="first_name"
                                label="First Name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                error={!!errors.first_name}
                                helperText={errors.first_name}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person color="action" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                required
                                fullWidth
                                id="last_name"
                                label="Last Name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                error={!!errors.last_name}
                                helperText={errors.last_name}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person color="action" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>
                        
                        {/* Email field */}
                        <Grid size={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email color="action" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>
                        
                        {/* Contact number field */}
                        <Grid size={12}>
                            <TextField
                                required
                                fullWidth
                                id="contact_number"
                                label="Contact Number"
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleInputChange}
                                error={!!errors.contact_number}
                                helperText={errors.contact_number}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone color="action" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>
                        
                        {/* Password field with toggle visibility */}
                        <Grid size={12}>
                            <TextField
                                required
                                fullWidth
                                id="password"
                                label="Password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleInputChange}
                                error={!!errors.password}
                                helperText={errors.password}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => handleTogglePassword('password')}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>
                        
                        {/* Confirm password field with toggle visibility */}
                        <Grid size={12}>
                            <TextField
                                required
                                fullWidth
                                id="rePassword"
                                label="Confirm Password"
                                name="rePassword"
                                type={showRePassword ? "text" : "password"}
                                value={formData.rePassword}
                                onChange={handleInputChange}
                                error={!!errors.rePassword}
                                helperText={errors.rePassword}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock color="action" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle confirm password visibility"
                                                    onClick={() => handleTogglePassword('rePassword')}
                                                    edge="end"
                                                >
                                                    {showRePassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                    
                    {/* Submit button - shows spinner during API call */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ 
                            mt: 4, 
                            mb: 2,
                            py: 1.2,
                            borderRadius: 1,
                            fontWeight: 'bold',
                            textTransform: 'none',
                            fontSize: '1rem'
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                    
                    {/* Link to login page for existing users */}
                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => navigate('/login')}
                        sx={{ 
                            textTransform: 'none'
                        }}
                    >
                        Already have an account? Sign in
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}