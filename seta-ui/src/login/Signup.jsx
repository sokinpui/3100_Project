// file: Signup.jsx
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Use RouterLink
import axios from 'axios';
import {
    Box, Paper, Typography, TextField, Button, Container, InputAdornment,
    Alert, IconButton, Avatar, CircularProgress, AlertTitle, Menu, MenuItem, Tooltip, Link // Added Link
} from '@mui/material';
import {
    AccountCircle, Person, Email, Phone, Lock, Visibility, VisibilityOff,
    HowToReg, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon,
    Language as LanguageIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import T from '../utils/T';

const API_URL = 'http://localhost:8000';

// Password validation function (keep as is or adjust if needed)
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;
    return passwordRegex.test(password);
};

export default function Signup() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { themeMode, updateTheme } = useTheme();
    const { language, updateLanguage } = useLanguage();

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '', first_name: '', last_name: '', email: '',
        contact_number: '', password: '', rePassword: ''
    });
    const [errors, setErrors] = useState({}); // Field-specific validation errors (keys)
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [signupSuccessMessage, setSignupSuccessMessage] = useState(''); // Success message string
    const [generalError, setGeneralError] = useState(''); // General/API error string
    const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
    const isLanguageMenuOpen = Boolean(languageAnchorEl);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear specific field error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        // Clear general error on any input change
        if (generalError) setGeneralError('');
    };

    const validateForm = () => {
        const validationErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{8}$/; // Simple 8-digit check

        if (!formData.username.trim()) validationErrors.username = 'signup.validationUsernameRequired';
        else if (/\s/.test(formData.username)) validationErrors.username = 'signup.validationUsernameNoSpaces'; // Added check for spaces
        else if (/[^a-zA-Z0-9_]/.test(formData.username)) validationErrors.username = 'signup.validationUsernameAlphaNumeric'; // Allow only letters, numbers, underscore

        if (!formData.first_name.trim()) validationErrors.first_name = 'signup.validationFirstNameRequired';
        if (!formData.last_name.trim()) validationErrors.last_name = 'signup.validationLastNameRequired';

        if (!formData.email.trim()) validationErrors.email = 'signup.validationEmailRequired';
        else if (!emailRegex.test(formData.email)) validationErrors.email = 'signup.validationEmailInvalid';

        if (!formData.contact_number.trim()) validationErrors.contact_number = 'signup.validationContactNumberRequired';
        else if (!phoneRegex.test(formData.contact_number)) validationErrors.contact_number = 'signup.validationContactNumberDigits';

        if (!formData.password) validationErrors.password = 'signup.validationPasswordRequired';
        else if (!validatePassword(formData.password)) validationErrors.password = 'signup.validationPasswordStrength';

        if (!formData.rePassword) validationErrors.rePassword = 'signup.validationConfirmPasswordRequired';
        else if (formData.password && formData.password !== formData.rePassword) validationErrors.rePassword = 'signup.validationPasswordMatch';

        return validationErrors;
    };


    const handleSignup = async (e) => {
        e.preventDefault();
        setGeneralError('');
        setSignupSuccessMessage('');
        const validationErrors = validateForm();
        setErrors(validationErrors); // Set errors based on validation

        if (Object.keys(validationErrors).length > 0) {
            return; // Stop if validation fails
        }

        setIsLoading(true);
        try {
            const userData = {
                username: formData.username.toLowerCase().trim(),
                email: formData.email.trim(),
                password: formData.password,
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                contact_number: formData.contact_number.trim()
            };
            const response = await axios.post(`${API_URL}/signup`, userData);
            setSignupSuccessMessage(response.data.message || t('signup.successMessageDefault'));
            setFormData({ // Clear form on success
                 username: '', first_name: '', last_name: '', email: '',
                 contact_number: '', password: '', rePassword: ''
            });

        } catch (error) {
            if (error.response) {
                // Handle specific backend errors (like username/email exists)
                const detail = error.response.data.detail;
                if (detail && typeof detail === 'string') {
                    if (detail.includes('Username already registered')) {
                        setErrors(prev => ({ ...prev, username: 'signup.errorUsernameExists' }));
                    } else if (detail.includes('Email already registered')) {
                         setErrors(prev => ({ ...prev, email: 'signup.errorEmailExists' }));
                    } else {
                         // Set as general error if not specific field
                        setGeneralError(detail || t('signup.errorSignupFailedInput'));
                    }
                } else {
                     setGeneralError(t('signup.errorSignupFailedGeneral'));
                }
            } else if (error.request) {
                setGeneralError(t('signup.errorServerNotResponding'));
            } else {
                setGeneralError(t('signup.errorUnknown'));
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleTogglePassword = (field) => {
        if (field === 'password') setShowPassword(!showPassword);
        else setShowRePassword(!showRePassword);
    };

    const handleToggleTheme = () => updateTheme(themeMode === 'dark' ? 'light' : 'dark');
    const handleLanguageMenuOpen = (event) => setLanguageAnchorEl(event.currentTarget);
    const handleLanguageMenuClose = () => setLanguageAnchorEl(null);
    const handleLanguageChange = (langCode) => {
        updateLanguage(langCode);
        i18n.changeLanguage(langCode);
        handleLanguageMenuClose();
    };

    // Determine if there are any validation errors to show the summary
    const hasValidationErrors = Object.values(errors).some(error => !!error);

    return (
        <Container
            component="main"
            maxWidth="sm" // Slightly wider for the signup form
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
                    <HowToReg fontSize="large" />
                </Avatar>
                <Typography component="h1" variant="h5" sx={{ fontWeight: 'medium', mb: 1 }}>
                    <T>signup.title</T>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    <T>signup.createAccountPrompt</T>
                </Typography>

                {/* --- Alerts --- */}
                 {generalError && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 1 }}>
                        {generalError} {/* Display general error string */}
                    </Alert>
                )}
                {signupSuccessMessage && (
                    <Alert severity="success" sx={{ width: '100%', mb: 2, borderRadius: 1 }}>
                        <AlertTitle><T>signup.successTitle</T></AlertTitle>
                        {signupSuccessMessage} {/* Display success message string */}
                    </Alert>
                )}
                {/* Optional: Show a summary warning if validation errors exist but no general/success message */}
                {hasValidationErrors && !generalError && !signupSuccessMessage && (
                  <Alert severity="warning" sx={{ width: '100%', mb: 2, borderRadius: 1 }}>
                    <T>signup.validationWarning</T>
                  </Alert>
                )}

                {/* --- Form (Conditionally Rendered) --- */}
                {!signupSuccessMessage && (
                    <Box component="form" onSubmit={handleSignup} noValidate sx={{ width: '100%', mt: 1 }}>
                        {/* Using Box with flex for simple two-column layout for names */}
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField
                                margin="normal" required fullWidth id="first_name"
                                label={t('signup.firstNameLabel')} name="first_name"
                                value={formData.first_name} onChange={handleInputChange}
                                error={!!errors.first_name} helperText={errors.first_name ? t(errors.first_name) : ''}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><Person color="action" /></InputAdornment>) }}
                                sx={{ flexGrow: 1 }} // Allow fields to grow equally
                            />
                            <TextField
                                margin="normal" required fullWidth id="last_name"
                                label={t('signup.lastNameLabel')} name="last_name"
                                value={formData.last_name} onChange={handleInputChange}
                                error={!!errors.last_name} helperText={errors.last_name ? t(errors.last_name) : ''}
                                InputProps={{ startAdornment: (<InputAdornment position="start"><Person color="action" /></InputAdornment>) }}
                                sx={{ flexGrow: 1 }}
                            />
                        </Box>
                         <TextField
                            margin="normal" required fullWidth id="username"
                            label={t('signup.usernameLabel')} name="username"
                            value={formData.username} onChange={handleInputChange}
                            error={!!errors.username} helperText={errors.username ? t(errors.username) : ''}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><AccountCircle color="action" /></InputAdornment>) }}
                        />
                        <TextField
                            margin="normal" required fullWidth id="email"
                            label={t('signup.emailLabel')} name="email" type="email"
                            value={formData.email} onChange={handleInputChange}
                            error={!!errors.email} helperText={errors.email ? t(errors.email) : ''}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>) }}
                        />
                         <TextField
                            margin="normal" required fullWidth id="contact_number"
                            label={t('signup.contactNumberLabel')} name="contact_number"
                            value={formData.contact_number} onChange={handleInputChange}
                            error={!!errors.contact_number} helperText={errors.contact_number ? t(errors.contact_number) : ''}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><Phone color="action" /></InputAdornment>) }}
                        />
                         <TextField
                            margin="normal" required fullWidth id="password"
                            label={t('signup.passwordLabel')} name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password} onChange={handleInputChange}
                            error={!!errors.password} helperText={errors.password ? t(errors.password) : ''}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
                                endAdornment: (<InputAdornment position="end"><IconButton aria-label={t(showPassword ? 'signup.hidePassword' : 'signup.showPassword')} onClick={() => handleTogglePassword('password')} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>),
                            }}
                        />
                        <TextField
                            margin="normal" required fullWidth id="rePassword"
                            label={t('signup.confirmPasswordLabel')} name="rePassword"
                            type={showRePassword ? "text" : "password"}
                            value={formData.rePassword} onChange={handleInputChange}
                            error={!!errors.rePassword} helperText={errors.rePassword ? t(errors.rePassword) : ''}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
                                endAdornment: (<InputAdornment position="end"><IconButton aria-label={t(showRePassword ? 'signup.hidePassword' : 'signup.showPassword')} onClick={() => handleTogglePassword('rePassword')} edge="end">{showRePassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>),
                            }}
                        />
                        <Button
                            type="submit" fullWidth variant="contained" size="large"
                            sx={{ mt: 3, mb: 2, py: 1.2, borderRadius: '20px', fontWeight: 'bold' }}
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : <T>signup.createAccountButton</T>}
                        </Button>
                    </Box>
                )}

                {/* --- Login Link --- */}
                <Box sx={{ textAlign: 'center', mt: signupSuccessMessage ? 1 : 2 }}>
                     <Typography variant="body2">
                        <T>{signupSuccessMessage ? 'signup.loginPromptSuccess' : 'signup.loginPrompt'}</T>{' '}
                         <Link component={RouterLink} to="/login" variant="body2" fontWeight="bold">
                            <T>signup.loginLink</T>
                        </Link>
                    </Typography>
                </Box>

            </Paper>
        </Container>
    );
}
