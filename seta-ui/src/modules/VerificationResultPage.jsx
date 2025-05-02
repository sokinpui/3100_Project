// src/modules/VerificationResultPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // Removed useNavigate as it's not used
import {
    Container, Typography, Paper, CircularProgress
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// Import useTranslation but mainly for accessing keys, not switching
// We don't need the T component if showing both languages explicitly
// import T from '../utils/T';

// Explicitly get translations for both languages within the component
import enTranslations from '../locales/en.json';
import zhTranslations from '../locales/zh.json';

export default function VerificationResultPage() {
    const location = useLocation();
    // Keep t for accessing keys, but we won't rely on its automatic switching here
    const [verificationStatus, setVerificationStatus] = useState('loading');
    const [errorCode, setErrorCode] = useState('');

    // Remove the useEffect that sets language from localStorage

    useEffect(() => {
        // Determine status (keep this logic)
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const code = params.get('code');

        if (status) {
            setVerificationStatus(status);
            if (code) {
                setErrorCode(code);
            }
        } else {
            setVerificationStatus('error');
            setErrorCode('invalid_access');
        }
    }, [location.search]); // Only depends on location.search

    // Helper to get nested translation value safely
    const getTranslation = (langObj, key) => {
        try {
            return key.split('.').reduce((obj, k) => obj && obj[k], langObj);
        } catch (e) {
            console.warn(`Translation key not found: ${key}`);
            return key; // Fallback to the key itself
        }
    };

    const renderContent = () => {
        switch (verificationStatus) {
            case 'success':
                return (
                    <>
                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            {getTranslation(enTranslations, 'verifyEmail.successTitle')} / {getTranslation(zhTranslations, 'verifyEmail.successTitle')}
                        </Typography>
                        <Typography sx={{ mb: 3 }}>
                            {getTranslation(enTranslations, 'verifyEmail.successMessageDesktop')}
                            <br /> {/* Line break */}
                            {getTranslation(zhTranslations, 'verifyEmail.successMessageDesktop')}
                        </Typography>
                    </>
                );
            case 'already_verified':
                return (
                    <>
                        <InfoOutlinedIcon color="info" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            {getTranslation(enTranslations, 'verifyEmail.alreadyVerifiedTitle')} / {getTranslation(zhTranslations, 'verifyEmail.alreadyVerifiedTitle')}
                        </Typography>
                        <Typography sx={{ mb: 3 }}>
                            {getTranslation(enTranslations, 'verifyEmail.alreadyVerifiedMessageDesktop')}
                            <br /> {/* Line break */}
                            {getTranslation(zhTranslations, 'verifyEmail.alreadyVerifiedMessageDesktop')}
                        </Typography>
                    </>
                );
            case 'error':
                let errorTitleKey = 'verifyEmail.errorTitle';
                let errorMessageKeyEN = 'verifyEmail.errorGenericDesktop';
                let errorMessageKeyZH = 'verifyEmail.errorGenericDesktop'; // Use same key structure

                if (errorCode === 'invalid_token') {
                    errorMessageKeyEN = 'verifyEmail.errorInvalidTokenDesktop';
                    errorMessageKeyZH = 'verifyEmail.errorInvalidTokenDesktop';
                } else if (errorCode === 'server_error') {
                    errorMessageKeyEN = 'verifyEmail.errorServerDesktop';
                    errorMessageKeyZH = 'verifyEmail.errorServerDesktop';
                }

                return (
                     <>
                        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                             {getTranslation(enTranslations, errorTitleKey)} / {getTranslation(zhTranslations, errorTitleKey)}
                        </Typography>
                        <Typography sx={{ mb: 3 }}>
                            {getTranslation(enTranslations, errorMessageKeyEN)}
                            <br /> {/* Line break */}
                            {getTranslation(zhTranslations, errorMessageKeyZH)}
                        </Typography>
                         <Typography variant="caption" color="text.secondary">
                            {getTranslation(enTranslations, 'verifyEmail.closeWindowHint')}
                            <br /> {/* Line break */}
                            {getTranslation(zhTranslations, 'verifyEmail.closeWindowHint')}
                         </Typography>
                     </>
                );
            case 'loading':
            default:
                return <CircularProgress sx={{ mt: 4 }} />;
        }
    };


    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
            <Paper elevation={3} sx={{ padding: { xs: 3, sm: 5 }, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', textAlign: 'center' }}>
                {renderContent()}
            </Paper>
        </Container>
    );
}
