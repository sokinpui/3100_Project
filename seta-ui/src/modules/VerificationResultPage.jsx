// src/modules/VerificationResultPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container, Typography, Paper, CircularProgress
} from '@mui/material'; // Removed Button and MuiLink
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
import T from '../utils/T'; // Your translation component

export default function VerificationResultPage() {
    const location = useLocation();
    const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error, already_verified
    const [errorCode, setErrorCode] = useState(''); // invalid_token, server_error

    useEffect(() => {
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
    }, [location.search]);

    const renderContent = () => {
        switch (verificationStatus) {
            case 'success':
                return (
                    <>
                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            <T>verifyEmail.successTitle</T>
                        </Typography>
                        <Typography sx={{ mb: 3 }}>
                            {/* Adjusted Message */}
                            <T>verifyEmail.successMessageDesktop</T>
                        </Typography>
                        {/* Button Removed */}
                    </>
                );
            case 'already_verified':
                return (
                    <>
                        <InfoOutlinedIcon color="info" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            <T>verifyEmail.alreadyVerifiedTitle</T>
                        </Typography>
                        <Typography sx={{ mb: 3 }}>
                             {/* Adjusted Message */}
                            <T>verifyEmail.alreadyVerifiedMessageDesktop</T>
                        </Typography>
                         {/* Button Removed */}
                    </>
                );
            case 'error':
                let errorTitleKey = 'verifyEmail.errorTitle';
                let errorMessageKey = 'verifyEmail.errorGenericDesktop'; // Adjusted key
                if (errorCode === 'invalid_token') {
                    errorMessageKey = 'verifyEmail.errorInvalidTokenDesktop'; // Adjusted key
                } else if (errorCode === 'server_error') {
                    errorMessageKey = 'verifyEmail.errorServerDesktop'; // Adjusted key
                }

                return (
                     <>
                        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            <T>{errorTitleKey}</T>
                        </Typography>
                        <Typography sx={{ mb: 3 }}><T>{errorMessageKey}</T></Typography>
                         {/* Button Removed */}
                         {/* Optionally suggest closing the window */}
                         <Typography variant="caption" color="text.secondary">
                             <T>verifyEmail.closeWindowHint</T>
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
