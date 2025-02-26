import { useState } from "react";
import { useNavigate } from 'react-router-dom';
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
import { user } from './testData';  // Importing user data from testData SHOULD DELETE AFTER HAVING API

export default function Login() {
  const navigate = useNavigate();
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
    
    // Clear error when typing
    if (error) {
      setError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!user.find(u => u.username === formData.username && u.password === formData.password)) {
        setError("Invalid username or password");
        setIsLoading(false);
        return;
      }
      
      localStorage.setItem('loginTime', new Date().getTime().toString());
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Login failed:', error);
      setError("An error occurred during login");
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
          backgroundColor: '#f8f9fa'
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
        
        {/* DEV MODE: Display test users - Remove in production */}
        {process.env.NODE_ENV !== 'production' && (
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              Test Users (Development Only)
            </Typography>
            <Box sx={{ 
              mt: 1,
              p: 1.5, 
              borderRadius: 1, 
              bgcolor: 'rgba(0,0,0,0.03)',
              fontSize: '0.75rem'
            }}>
              {user.map((data, index) => (
                <Box key={index} sx={{ mb: index !== user.length - 1 ? 1 : 0 }}>
                  <Typography variant="caption" display="block" sx={{ fontWeight: 'medium' }}>
                    Username: {data.username}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Password: {data.password}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}