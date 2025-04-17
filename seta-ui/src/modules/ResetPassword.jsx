import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';

export default function ResetPassword() {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();
  const API_URL = 'http://localhost:8000';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    const errors = { password: '', confirmPassword: '' };
    let isValid = true;

    if (!password) {
      errors.password = 'New password is required';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (password && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, {
        new_password: password,
        confirm_password: confirmPassword, // Send confirmation for backend validation
      });
      setSuccess(response.data.message || 'Password reset successfully! Redirecting to login...');
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { state: { message: 'Password reset successfully! Please log in.' } });
      }, 3000);

    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.response?.data?.detail || 'Failed to reset password. The link might be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          Reset Your Password
        </Typography>

        {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        {!success && ( // Only show form if not successful yet
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: '' }));
              }}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (validationErrors.confirmPassword) setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </Box>
        )}
         {success && ( // Optionally show a link back to login if successful
            <Button
                onClick={() => navigate('/login')}
                fullWidth
                variant="text"
                sx={{ mt: 1 }}
            >
                Go to Login
            </Button>
         )}
      </Paper>
    </Container>
  );
}