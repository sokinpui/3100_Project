// src/modules/ResetPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Box, TextField, Button, Typography, Alert,
  CircularProgress, Paper
} from '@mui/material';
// --- ADD Imports ---
import { useTranslation } from 'react-i18next';
import T from '../utils/T'; // Assuming T component correctly handles translation
// --- END ADD ---

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const API_URL = 'http://localhost:8000';
  // --- ADD useTranslation hook ---
  const { t } = useTranslation();
  // --- END ADD ---

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); // Store translation key or fallback message
  const [success, setSuccess] = useState(''); // Store translation key or fallback message
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    const errors = { password: '', confirmPassword: '' };
    let isValid = true;

    if (!password) {
      errors.password = 'resetPassword.validationPasswordRequired'; // Use key
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'resetPassword.validationPasswordLength'; // Use key
      isValid = false;
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'resetPassword.validationConfirmRequired'; // Use key
      isValid = false;
    } else if (password && password !== confirmPassword) {
      errors.confirmPassword = 'resetPassword.validationPasswordMatch'; // Use key
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
        confirm_password: confirmPassword,
      });
      // Set success message using translation key
      setSuccess(response.data.message || t('resetPassword.successMessage'));
      setTimeout(() => {
        navigate('/login', { state: { message: t('resetPassword.successMessage') } }); // Pass translated message if needed
      }, 3000);

    } catch (err) {
      console.error("Password reset error:", err);
      // Set error message using translation key or fallback
      setError(err.response?.data?.detail || t('resetPassword.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
          {/* Use T component or t() */}
          <T>resetPassword.title</T>
        </Typography>

        {/* Use t() for alert messages */}
        {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{t(success)}</Alert>}
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{t(error)}</Alert>}

        {!success && (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              // Use t() for label
              label={t('resetPassword.newPasswordLabel')}
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: '' }));
              }}
              // Use t() for helperText
              error={!!validationErrors.password}
              helperText={validationErrors.password ? t(validationErrors.password) : ''}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              // Use t() for label
              label={t('resetPassword.confirmPasswordLabel')}
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (validationErrors.confirmPassword) setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              // Use t() for helperText
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword ? t(validationErrors.confirmPassword) : ''}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {/* Use T component or t() */}
              {loading ? <CircularProgress size={24} /> : <T>resetPassword.resetButton</T>}
            </Button>
          </Box>
        )}
         {success && (
            <Button
                onClick={() => navigate('/login')}
                fullWidth
                variant="text"
                sx={{ mt: 1 }}
            >
                {/* Use T component or t() */}
                <T>resetPassword.goToLoginButton</T>
            </Button>
         )}
      </Paper>
    </Container>
  );
}
