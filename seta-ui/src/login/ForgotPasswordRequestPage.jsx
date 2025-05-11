// src/login/ForgotPasswordRequestPage.jsx
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Paper, Typography, TextField, Button, Container,
    Alert, IconButton, Avatar, CircularProgress, Menu, MenuItem, Tooltip, Link, AlertTitle, InputAdornment
} from '@mui/material';
import { Email, LockReset as LockResetIcon, ArrowBack as ArrowBackIcon, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon, Language as LanguageIcon, CheckCircleOutline as CheckCircleOutlineIcon } from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material/styles'; // To distinguish from custom useTheme
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import T from '../utils/T';

const API_URL = 'http://localhost:8000';

export default function ForgotPasswordRequestPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const muiTheme = useMuiTheme(); // MUI theme for styling
    const { themeMode, updateTheme } = useTheme(); // Custom theme context
    const { language, updateLanguage: setAppLanguage } = useLanguage(); // Custom language context

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'info'
    const [emailError, setEmailError] = useState('');

    const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
    const isLanguageMenuOpen = Boolean(languageAnchorEl);

    const handleInputChange = (e) => {
        setEmail(e.target.value);
        if (message) setMessage('');
        if (emailError) setEmailError('');
    };

    const validateEmail = () => {
        if (!email.trim()) {
            setEmailError(t('forgotPassword.validationEmailRequired'));
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError(t('forgotPassword.validationEmailInvalid'));
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail()) {
            return;
        }

        setIsLoading(true);
        setMessage('');
        setMessageType('info');

        try {
            const response = await axios.post(`${API_URL}/request-password-reset-code`, { email });
            setMessage(response.data.message || t('forgotPassword.successMessageRequest')); // Use translation key
            setMessageType('success');
            // Don't clear email here, user might need it on the next page if not auto-navigated with state
            // setEmail('');
            // Navigate to verify code page, passing email as state
            setTimeout(() => {
                navigate('/verify-code-reset', { state: { email: email } });
            }, 2000); // Delay for user to read message

        } catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                setMessage(error.response.data.detail);
            } else {
                setMessage(t('forgotPassword.errorGeneric'));
            }
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleTheme = () => updateTheme(themeMode === 'dark' ? 'light' : 'dark');
    const handleLanguageMenuOpen = (event) => setLanguageAnchorEl(event.currentTarget);
    const handleLanguageMenuClose = () => setLanguageAnchorEl(null);
    const handleLanguageChange = (langCode) => {
        setAppLanguage(langCode);
        i18n.changeLanguage(langCode);
        handleLanguageMenuClose();
    };

    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                py: 4,
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    p: { xs: 3, sm: 4 },
                    width: '100%',
                    borderRadius: 2,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: muiTheme.palette.background.paper, // Use MUI theme for paper background
                }}
            >
                <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                    <Tooltip title={t('settings.language')}>
                        <IconButton onClick={handleLanguageMenuOpen} size="small" sx={{ color: muiTheme.palette.text.secondary }}>
                            <LanguageIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t(themeMode === 'dark' ? 'settings.lightMode' : 'settings.darkMode')}>
                        <IconButton onClick={handleToggleTheme} size="small" sx={{ color: muiTheme.palette.text.secondary }}>
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

                <Avatar sx={{ m: 1, mt: 3, bgcolor: 'secondary.main', width: 56, height: 56 }}>
                    <LockResetIcon fontSize="large" />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ fontWeight: 'medium', mb: 1, color: muiTheme.palette.text.primary }}>
                    <T>forgotPassword.title</T>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                    <T>forgotPassword.instruction</T>
                </Typography>

                {message && (
                    <Alert
                        severity={messageType}
                        icon={messageType === 'success' ? <CheckCircleOutlineIcon fontSize="inherit" /> : undefined}
                        sx={{ width: '100%', mb: 2, borderRadius: 1 }}
                    >
                        {messageType === 'success' && <AlertTitle><T>forgotPassword.successTitleRequest</T></AlertTitle>}
                        {message.includes('.') ? <T>{message}</T> : message}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label={t('forgotPassword.emailLabel')}
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleInputChange}
                        autoComplete="email"
                        autoFocus
                        error={!!emailError}
                        helperText={emailError}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>)
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 3, mb: 2, py: 1.2, borderRadius: '20px', fontWeight: 'bold' }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : <T>forgotPassword.sendResetCodeButton</T>}
                    </Button>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Link component={RouterLink} to="/login" variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <T>forgotPassword.backToLogin</T>
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
}
