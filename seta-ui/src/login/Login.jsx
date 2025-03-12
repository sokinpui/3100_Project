import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Paper, Typography, TextField, Button, Container, InputAdornment,
  Alert, IconButton, Avatar, CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  AccountCircle, Lock, Visibility, VisibilityOff, Login as LoginIcon,
  Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const API_URL = 'http://localhost:8000';

export default function Login() {
  const navigate = useNavigate();
  const { themeMode, updateTheme } = useTheme(); // Access global theme
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username: formData.username.toLowerCase(),
        password: formData.password
      });
      const userData = response.data;
      localStorage.setItem('loginTime', new Date().getTime().toString());
      localStorage.setItem('username', userData.username);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('email', userData.email);
      navigate('/', { replace: true });
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401: setError('Invalid username or password'); break;
          case 404: setError('User not found'); break;
          case 400: setError('Account is disabled'); break;
          default: setError('Login failed. Please try again.');
        }
      } else if (error.request) {
        setError('Server not responding. Please try again later.');
      } else {
        setError('An error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleToggleTheme = () => {
    updateTheme(themeMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <Container
      maxWidth="xs"
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
            <LoginIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', letterSpacing: '1px' }}>
            SETA Login
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Sign in to your account
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} noValidate>
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
                autoComplete="username"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
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
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
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
              mt: 3,
              mb: 2,
              py: 1.2,
              borderRadius: 1,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
            }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button
              variant="text"
              onClick={() => navigate('/signup')}
              sx={{ textTransform: 'none' }}
            >
              Don’t have an account? Sign up
            </Button>
            <IconButton onClick={handleToggleTheme} aria-label="toggle theme">
              {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2">
            Login Info (Currently available accounts): <br />
            <strong>Username:</strong> test <br />
            <strong>Password:</strong> Password123 <br />
            {localStorage.getItem('username') && (
              <>
                <strong>Username:</strong> {localStorage.getItem('username')} <br />
                <strong>Password:</strong> [Set during signup] <br />
              </>
            )}
            <br />
            <strong sx={{ color: 'error.main' }}>
              Note: Make sure Python backend is running before logging in!
            </strong>
            <br />
            <strong sx={{ color: 'error.main' }}>
              Additional Note: Newly registered user credentials appear here for development.
            </strong>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
