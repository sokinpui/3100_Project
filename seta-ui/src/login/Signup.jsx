import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
//   Grid, 
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
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const navigate = useNavigate();

    const handleSignup = (e) => {
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
            setIsLoading(true);
            // Simulate API call
            setTimeout(() => {
                setIsLoading(false);
                navigate('/login');
                // Show success alert instead of using JavaScript alert
                alert('Signup successful, please check email for confirmation link');
            }, 1500);
        } else {
            setErrors(errors);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        // Clear error when user starts typing again
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleTogglePassword = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowRePassword(!showRePassword);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ 
            my: 8,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Paper 
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    borderRadius: 2,
                    backgroundColor: '#f8f9fa'
                }}
            >
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

                {Object.values(errors).some(error => error) && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 1 }}
                    >
                        Please correct the errors in the form
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSignup} noValidate>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <TextField
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                error={!!(errors.username || errors.username2)}
                                helperText={errors.username || errors.username2}
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
                                id="firstName"
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
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
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
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
                        <Grid size={12}>
                            <TextField
                                required
                                fullWidth
                                id="contactNumber"
                                label="Contact Number"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                error={!!errors.contactNumber}
                                helperText={errors.contactNumber}
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