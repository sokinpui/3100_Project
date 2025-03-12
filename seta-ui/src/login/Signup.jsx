import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Paper, Typography, TextField, Button, Container, InputAdornment,
  Alert, IconButton, Avatar, CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  AccountCircle, Person, Email, Phone, Lock, Visibility, VisibilityOff,
  HowToReg, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = 'http://localhost:8000';

export default function Signup() {
  const navigate = useNavigate();
  const { themeMode, updateTheme } = useTheme(); // Access global theme
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    password: '',
    rePassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
      const userData = {
        username: formData.username.toLowerCase(),
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        contact_number: formData.contact_number
      };
      await axios.post(`${API_URL}/signup`, userData);
      localStorage.setItem('username', userData.username);
      setIsLoading(false);
      navigate('/login', { state: { message: 'Signup successful! Please log in.' } });
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        if (error.response.status === 400 && error.response.data.detail.includes('Username already registered')) {
          setErrors({ username: 'Username already exists' });
        } else {
          setErrors({ general: error.response.data.detail || 'Signup failed. Please try again.' });
        }
      } else if (error.request) {
        setErrors({ general: 'Server not responding. Please try again later.' });
      } else {
        setErrors({ general: 'An error occurred during signup' });
      }
    }
  };

  const validatePassword = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
    return !passwordRegex.test(formData.password);
  };

  const validateForm = () => {
    const validationErrors = {};
    if (/[`~!@#$%^&*()_.|+\-=?;:'",<>\{\}\[\]\\\/]/g.test(formData.username)) {
      validationErrors.username = 'Username should not contain special characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) validationErrors.email = 'Please enter a valid email address';
    if (formData.contact_number.search(/^[0-9]{8}$/) === -1) {
      validationErrors.contact_number = 'Contact number must be 8 digits';
    }
    if (validatePassword()) {
      validationErrors.password = 'Password must contain at least 8 characters, an upper-case letter, a lower-case letter, a number and a special symbol';
    }
    if (formData.password !== formData.rePassword) validationErrors.rePassword = 'Passwords do not match';
    if (!formData.username) validationErrors.username = 'Username is required';
    if (!formData.first_name) validationErrors.first_name = 'First name is required';
    if (!formData.last_name) validationErrors.last_name = 'Last name is required';
    if (!formData.email) validationErrors.email = 'Email is required';
    if (!formData.contact_number) validationErrors.contact_number = 'Contact number is required';
    if (!formData.password) validationErrors.password = 'Password is required';
    if (!formData.rePassword) validationErrors.rePassword = 'Please confirm your password';
    return validationErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleTogglePassword = (field) => {
    if (field === 'password') setShowPassword(!showPassword);
    else setShowRePassword(!showRePassword);
  };

  const handleToggleTheme = () => {
    updateTheme(themeMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <HowToReg fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', letterSpacing: '1px' }}>
            SETA Signup
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Create your account to get started
          </Typography>
        </Box>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
            {errors.general}
          </Alert>
        )}
        {Object.values(errors).some(error => error) && !errors.general && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
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
                error={!!errors.username}
                helperText={errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
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
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleTogglePassword('password')} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleTogglePassword('rePassword')} edge="end">
                        {showRePassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
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
              fontSize: '1rem',
            }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none' }}
            >
              Already have an account? Sign in
            </Button>
            <IconButton onClick={handleToggleTheme} aria-label="toggle theme">
              {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
