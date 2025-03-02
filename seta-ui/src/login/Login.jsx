import { useState } from "react";
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
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';

// Backend API URL for authentication endpoints, currently hardcoded
const API_URL = 'http://localhost:8000';
export default function Login() {
  const navigate = useNavigate(); // For navigation after login
  const [isLoading, setIsLoading] = useState(false); // Controls loading state during API calls
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [error, setError] = useState(""); // For displaying authentication errors
  const [formData, setFormData] = useState({
    // Form fields for login
    username: '',
    password: ''
  });

  /**
   * Updates form data state when input values change
   * Also clears any error messages when user starts typing
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error message when user starts typing
    if (error) {
      setError("");
    }
  };

  /**
   * Handles the login form submission
   * 1. Prevents default form submission
   * 2. Submits credentials to the API
   * 3. Stores user data in localStorage on success
   * 4. Handles error responses with meaningful messages
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading state
    
    try {
      // Send POST request to login endpoint
      const response = await axios.post(`${API_URL}/login`, {
        username: formData.username,
        password: formData.password
      });
      
      // Extract user data from successful response
      const userData = response.data;
      
      // Store essential user info in localStorage for session management
      localStorage.setItem('loginTime', new Date().getTime().toString()); // For session timeout
      localStorage.setItem('username', userData.username); // For displaying username
      localStorage.setItem('userId', userData.id); // For API calls that need user ID
      
      // Navigate to dashboard on successful login
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      
      // Comprehensive error handling based on API response
      if (error.response) {
        // API responded with an error status code
        switch (error.response.status) {
          case 401: // Invalid credentials
            setError("Invalid username or password");
            break;
          case 404: // User not found
            setError("User not found");
            break;
          case 400: // disabled account
            setError("Account is disabled");
            break;
          default: // Other API errors
            setError("Login failed. Please try again.");
        }
      } else if (error.request) {
        // Request was made but no response (network issues)
        setError("Server not responding. Please try again later.");
      } else {
        // Error in request setup
        setError("An error occurred during login");
      }
    } finally {
      setIsLoading(false); // End loading state regardless of outcome
    }
  };

  // Toggles password visibility in the password field (that eye icon)
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Component rendering - UI for login form
  return (
    // Container wraps the entire form with proper spacing and centering
    <Container maxWidth="xs" sx={{ 
      my: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto'
    }}>
      {/* Paper component gives the form a card-like appearance */}
      <Paper 
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          justifyContent: 'center',
          borderRadius: 2,
          backgroundColor: '#f8f9fa'
        }}
      >
        {/* Header section with icon and title */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3
        }}>
          <Avatar sx={{ 
            m: 1, 
            bgcolor: 'primary.main',
            width: 56,
            height: 56
          }}>
            <LoginIcon fontSize="large" />
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
            SETA Login
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Sign in to your account
          </Typography>
        </Box>

        {/* Error alert - displays authentication errors */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 1 }}
          >
            {error}
          </Alert>
        )}

        {/* Main login form */}
        <Box component="form" onSubmit={handleLogin} noValidate>
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
                autoComplete="username" // Helps browsers autofill
                autoFocus // Focus on this field when form loads
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle color="action" />
                      </InputAdornment>
                    )
                  }
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
                autoComplete="current-password" // Helps browsers autofill
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
                          onClick={handleTogglePassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
          </Grid>
          
          {/* Login button - shows spinner during API call */}
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
              fontSize: '1rem'
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
          
          {/* Link to signup page for new users */}
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/signup')}
            sx={{ 
              textTransform: 'none'
            }}
          >
            Don't have an account? Sign up
          </Button>
        </Box>
        
        {/* Development-only section for test users - commented out for production */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Login Info (Currently only has 1 account to login): <br />
            <strong>Username:</strong> test <br />
            <strong>Password:</strong> Password123.
            <br/><br/>
            <strong style={{color: "red"}}>Note: Make sure python backend is running before logging in!</strong>
            <br></br>
            <strong style={{color: "red"}}>Additional Note: Please include the newly registered user credentials above for development purposes</strong>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}