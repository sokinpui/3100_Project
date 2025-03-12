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
  CircularProgress,
  useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  AccountCircle,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon
} from '@mui/icons-material';

// Move API URL to environment variable or config file
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (error) {
      setError("");
    }
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
          case 401:
            setError("Invalid username or password");
            break;
          case 404:
            setError("User not found");
            break;
          case 400:
            setError("Account is disabled");
            break;
          default:
            setError("Login failed. Please try again.");
        }
      } else if (error.request) {
        setError("Server not responding. Please try again later.");
      } else {
        setError("An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="xs" sx={{
      my: 8,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto'
    }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          justifyContent: 'center',
          borderRadius: 2,
          bgcolor: 'background.paper', // Use theme-aware color
          color: 'text.primary' // Use theme-aware color for text
        }}
      >
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

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 1 }}
          >
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
                      <AccountCircle color="action" />
                    </InputAdornment>
                  )
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
                autoComplete="current-password"
                InputProps={{
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

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Login Info (Currently only has 1 account to login): <br />
            <strong>Username:</strong> test <br />
            <strong>Password:</strong> Password123.
            <br/><br/>
            <strong style={{color: theme.palette.error.main}}>Note: Make sure python backend is running before logging in!</strong>
            <br/>
            <strong style={{color: theme.palette.error.main}}>Additional Note: Please include the newly registered user credentials above for development purposes</strong>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
