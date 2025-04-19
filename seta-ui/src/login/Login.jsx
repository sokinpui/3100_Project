// file: Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Use RouterLink for navigation
import axios from 'axios';
import {
    Box, Paper, Typography, TextField, Button, Container, InputAdornment,
    Alert, IconButton, Avatar, CircularProgress, Menu, MenuItem, Tooltip, Link // Added Link
} from '@mui/material';
import {
    AccountCircle, Lock, Visibility, VisibilityOff, Login as LoginIcon,
    Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon,
    Language as LanguageIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import T from '../utils/T'; // Assuming T component correctly handles translation

const API_URL = 'http://localhost:8000';

export default function Login() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { themeMode, updateTheme } = useTheme();
    const { language, updateLanguage } = useLanguage();

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(''); // Stores translation key
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
    const isLanguageMenuOpen = Boolean(languageAnchorEl);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/login`, {
                username: formData.username.toLowerCase().trim(), // Trim whitespace
                password: formData.password
            });
            const userData = response.data;
            localStorage.setItem('loginTime', new Date().getTime().toString());
            localStorage.setItem('username', userData.username);
            localStorage.setItem('userId', userData.id);
            localStorage.setItem('email', userData.email);
            // Navigate to root, AuthGuard will redirect to dashboard
            navigate('/', { replace: true });
        } catch (err) {
            if (err.response) {
                switch (err.response.status) {
                    case 401: setError('login.errorInvalidCredentials'); break;
                    case 404: setError('login.errorUserNotFound'); break;
                    case 400: setError('login.errorAccountDisabled'); break; // Assuming 400 might mean disabled
                    default: setError('login.errorLoginFailed');
                }
            } else if (err.request) {
                setError('login.errorServerNotResponding');
            } else {
                setError('login.errorUnknown');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePassword = () => setShowPassword(!showPassword);
    const handleToggleTheme = () => updateTheme(themeMode === 'dark' ? 'light' : 'dark');
    const handleLanguageMenuOpen = (event) => setLanguageAnchorEl(event.currentTarget);
    const handleLanguageMenuClose = () => setLanguageAnchorEl(null);
    const handleLanguageChange = (langCode) => {
        updateLanguage(langCode);
        i18n.changeLanguage(langCode);
        handleLanguageMenuClose();
    };

    return (
        <Container
            component="main" // Use main semantic element
            maxWidth="xs"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                py: 4, // Add some vertical padding
            }}
        >
            <Paper
                elevation={4} // Slightly more shadow
                sx={{
                    p: { xs: 3, sm: 4 }, // Responsive padding
                    width: '100%',
                    borderRadius: 2, // Softer corners
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center', // Center content inside paper
                }}
            >
                {/* --- Top Right Toggles --- */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                    <Tooltip title={t('settings.language')}>
                        <IconButton onClick={handleLanguageMenuOpen} size="small">
                            <LanguageIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t(themeMode === 'dark' ? 'settings.lightMode' : 'settings.darkMode')}>
                        <IconButton onClick={handleToggleTheme} size="small">
                            {themeMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>
                <Menu
                    anchorEl={languageAnchorEl}
                    open={isLanguageMenuOpen}
                    onClose={handleLanguageMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MenuItem onClick={() => handleLanguageChange('english')} selected={language === 'english'}>English</MenuItem>
                    <MenuItem onClick={() => handleLanguageChange('zh')} selected={language === 'zh'}>中文</MenuItem>
                </Menu>

                {/* --- Header --- */}
                <Avatar sx={{ m: 1, mt: 3, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <LoginIcon fontSize="large" />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ fontWeight: 'medium', mb: 1 }}>
                    <T>login.title</T>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    <T>login.signInPrompt</T>
                </Typography>

                {/* --- Error Alert --- */}
                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 1 }}>
                        <T>{error}</T>
                    </Alert>
                )}

                {/* --- Form --- */}
                <Box component="form" onSubmit={handleLogin} noValidate sx={{ width: '100%' }}>
                    <TextField
                        margin="normal" // Consistent spacing
                        required
                        fullWidth
                        id="username"
                        label={t('login.usernameLabel')}
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        autoComplete="username"
                        autoFocus
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start"><AccountCircle color="action" /></InputAdornment>
                            ),
                        }}
                        variant="outlined" // Ensure outlined style
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        label={t('login.passwordLabel')}
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        autoComplete="current-password"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start"><Lock color="action" /></InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleTogglePassword} edge="end" aria-label={t(showPassword ? 'login.hidePassword' : 'login.showPassword')}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        variant="outlined"
                    />

                    {/* Optional: Add Forgot Password Link Here */}
                    {/*
                    <Box sx={{ textAlign: 'right', my: 1 }}>
                         <Link component={RouterLink} to="/forgot-password" variant="body2">
                            <T>login.forgotPasswordPrompt</T>
                        </Link>
                    </Box>
                    */}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large" // Make button slightly larger
                        sx={{
                            mt: 3,
                            mb: 2,
                            py: 1.2, // Vertical padding
                            borderRadius: '20px', // Pill shape
                            fontWeight: 'bold',
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : <T>login.signInButton</T>}
                    </Button>

                    {/* --- Sign Up Link --- */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2">
                            <T>login.noAccountPrompt</T>{' '}
                            <Link component={RouterLink} to="/signup" variant="body2" fontWeight="bold">
                                <T>login.signupLink</T>
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}
