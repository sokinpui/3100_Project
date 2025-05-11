// src/login/VerifyCodeAndResetPage.jsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Paper, Typography, TextField, Button, Container,
    Alert, IconButton, Avatar, CircularProgress, Menu, MenuItem, Tooltip, Link, AlertTitle, InputAdornment
} from '@mui/material';
import { VpnKey, Lock, LockReset as LockResetIcon, ArrowBack as ArrowBackIcon, Visibility, VisibilityOff, CheckCircleOutline as CheckCircleOutlineIcon, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon, Language as LanguageIcon } from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import T from '../utils/T';
import { Email } from '@mui/icons-material';

const API_URL = 'http://localhost:8000';

export default function VerifyCodeAndResetPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation(); // To get email from navigation state
    const muiTheme = useMuiTheme();
    const { themeMode, updateTheme } = useTheme();
    const { language, updateLanguage: setAppLanguage } = useLanguage();

    const [formData, setFormData] = useState({
        email: location.state?.email || '', // Pre-fill email if passed
        code: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
    const isLanguageMenuOpen = Boolean(languageAnchorEl);

    useEffect(() => {
        if (!location.state?.email) {
            // If email not passed, maybe redirect or show error
            setMessage(t('verifyResetCode.errorEmailMissing'));
            setMessageType('error');
        }
    }, [location.state, t]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
        if (message) setMessage('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = t('verifyResetCode.validationEmailRequired');
        if (!formData.code.trim()) newErrors.code = t('verifyResetCode.validationCodeRequired');
        else if (!/^\d{6}$/.test(formData.code)) newErrors.code = t('verifyResetCode.validationCodeFormat');

        if (!formData.newPassword) newErrors.newPassword = t('verifyResetCode.validationNewPasswordRequired');
        else if (formData.newPassword.length < 8) newErrors.newPassword = t('verifyResetCode.validationPasswordLength');
        // Add more password strength checks if desired (e.g., using a regex)

        if (!formData.confirmPassword) newErrors.confirmPassword = t('verifyResetCode.validationConfirmPasswordRequired');
        else if (formData.newPassword && formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = t('verifyResetCode.validationPasswordMatch');

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setMessage('');
        setMessageType('info');

        try {
            const payload = {
                email: formData.email,
                code: formData.code,
                new_password: formData.newPassword,
                confirm_password: formData.confirmPassword
            };
            const response = await axios.post(`${API_URL}/verify-code-and-reset-password`, payload);
            setMessage(response.data.message || t('verifyResetCode.successMessage'));
            setMessageType('success');
            setTimeout(() => {
                navigate('/login');
            }, 3000); // Redirect after 3 seconds

        } catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                setMessage(error.response.data.detail);
            } else {
                setMessage(t('verifyResetCode.errorGeneric'));
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
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
            <Paper elevation={4} sx={{ p: { xs: 3, sm: 4 }, width: '100%', borderRadius: 2, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: muiTheme.palette.background.paper }}>
                <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
                    <Tooltip title={t('settings.language')}><IconButton onClick={handleLanguageMenuOpen} size="small" sx={{ color: muiTheme.palette.text.secondary }}><LanguageIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title={t(themeMode === 'dark' ? 'settings.lightMode' : 'settings.darkMode')}><IconButton onClick={handleToggleTheme} size="small" sx={{ color: muiTheme.palette.text.secondary }}>{themeMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}</IconButton></Tooltip>
                </Box>
                <Menu anchorEl={languageAnchorEl} open={isLanguageMenuOpen} onClose={handleLanguageMenuClose}><MenuItem onClick={() => handleLanguageChange('english')} selected={language === 'english'}>English</MenuItem><MenuItem onClick={() => handleLanguageChange('zh')} selected={language === 'zh'}>中文</MenuItem></Menu>

                <Avatar sx={{ m: 1, mt: 3, bgcolor: 'secondary.main', width: 56, height: 56 }}><LockResetIcon fontSize="large" /></Avatar>
                <Typography component="h1" variant="h5" sx={{ fontWeight: 'medium', mb: 1, color: muiTheme.palette.text.primary }}><T>verifyResetCode.title</T></Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}><T>verifyResetCode.instruction</T></Typography>

                {message && (
                    <Alert severity={messageType} icon={messageType === 'success' ? <CheckCircleOutlineIcon fontSize="inherit" /> : undefined} sx={{ width: '100%', mb: 2, borderRadius: 1 }}>
                        {messageType === 'success' && <AlertTitle><T>verifyResetCode.successTitle</T></AlertTitle>}
                        {message.includes('.') ? <T>{message}</T> : message}
                    </Alert>
                )}

                {! (messageType === 'success') && ( // Hide form on final success
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
                    <TextField margin="normal" required fullWidth id="email" label={t('verifyResetCode.emailLabel')} name="email" value={formData.email} onChange={handleInputChange} error={!!errors.email} helperText={errors.email} InputProps={{ readOnly: !!location.state?.email, startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>)}} />
                    <TextField margin="normal" required fullWidth id="code" label={t('verifyResetCode.codeLabel')} name="code" value={formData.code} onChange={handleInputChange} error={!!errors.code} helperText={errors.code} InputProps={{ startAdornment: (<InputAdornment position="start"><VpnKey color="action" /></InputAdornment>) }} />
                    <TextField
                        margin="normal" required fullWidth name="newPassword" label={t('verifyResetCode.newPasswordLabel')} type={showNewPassword ? 'text' : 'password'} id="newPassword" value={formData.newPassword} onChange={handleInputChange} error={!!errors.newPassword} helperText={errors.newPassword}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
                            endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">{showNewPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                        }}
                    />
                    <TextField
                        margin="normal" required fullWidth name="confirmPassword" label={t('verifyResetCode.confirmPasswordLabel')} type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} error={!!errors.confirmPassword} helperText={errors.confirmPassword}
                        InputProps={{
                            startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
                            endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                        }}
                    />
                    <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, mb: 2, py: 1.2, borderRadius: '20px', fontWeight: 'bold' }} disabled={isLoading || !formData.email}>
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : <T>verifyResetCode.resetButton</T>}
                    </Button>
                </Box>
                )}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Link component={RouterLink} to="/login" variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <T>verifyResetCode.backToLogin</T>
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
}
