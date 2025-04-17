// src/modules/ExpenseImport/ExpenseImport.jsx
import React, { useState, useRef, useCallback } from 'react';
import {
    Container, Card, CardHeader, CardContent, Button, Box, Typography,
    LinearProgress, Alert, List, ListItem, ListItemText, ListItemIcon, Chip
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ErrorIcon from '@mui/icons-material/Error';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import T from '../../utils/T';

const API_URL = 'http://localhost:8000';

export default function ExpenseImport() {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [importResult, setImportResult] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            setSelectedFile(file);
            setError(null);
            setImportResult(null);
        } else {
            setSelectedFile(null);
            setError(t('expenseImport.invalidFileType'));
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        fileInputRef.current?.click();
    };

    const handleUpload = useCallback(async () => {
        if (!selectedFile || !userId) return;

        setIsLoading(true);
        setError(null);
        setImportResult(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post(
                `${API_URL}/expenses/import/${userId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setImportResult(response.data);
            setSelectedFile(null);

        } catch (err) {
            console.error("Import API error:", err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t('expenseImport.apiError');
            setError(apiError);
            setImportResult(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectedFile, userId, t]);

    return (
        <Container maxWidth="md">
            <Card elevation={3} sx={{ mt: 4, borderRadius: 2 }}>
                <CardHeader
                    title={<T>expenseImport.title</T>}
                    sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', py: 1.5 }}
                />
                <CardContent>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        <T>expenseImport.description</T>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <T>expenseImport.requiredHeadersInfo</T>
                        <Box component="span" sx={{ fontWeight: 'bold' }}> date, amount, category_name</Box>.
                        <T>expenseImport.optionalHeadersInfo</T>
                        <Box component="span" sx={{ fontWeight: 'bold' }}> description</Box>.
                        <T>expenseImport.dateFormatInfo</T>
                        <Box component="span" sx={{ fontWeight: 'bold' }}> YYYY-MM-DD</Box>.
                    </Typography>

                    <input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="csv-upload-input"
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            onClick={handleButtonClick}
                            disabled={isLoading}
                        >
                            <T>expenseImport.selectFile</T>
                        </Button>

                        {selectedFile && (
                            <Chip label={selectedFile.name} onDelete={() => setSelectedFile(null)} disabled={isLoading} />
                        )}

                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={!selectedFile || isLoading}
                            sx={{ ml: 'auto' }}
                        >
                            {isLoading ? t('expenseImport.processing') : t('expenseImport.uploadAndProcess')}
                        </Button>
                    </Box>

                    {isLoading && <LinearProgress sx={{ mb: 2 }} />}

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {typeof error === 'string' ? error : JSON.stringify(error)}
                        </Alert>
                    )}

                    {importResult && (
                        <Alert
                            severity={importResult.errors?.length > 0 ? "warning" : "success"}
                            sx={{ mb: 2 }}
                        >
                            <Typography fontWeight="bold">{importResult.message}</Typography>
                            <Typography variant="body2">
                                {t('expenseImport.importedCount', { count: importResult.imported_count })}
                            </Typography>
                            {importResult.skipped_rows?.length > 0 && (
                                <Typography variant="body2">
                                    {t('expenseImport.skippedCount', { count: importResult.skipped_rows.length })}
                                </Typography>
                            )}
                            {importResult.errors?.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="caption" fontWeight="bold">Errors:</Typography>
                                    <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                                        {importResult.errors.map((err, index) => (
                                            <ListItem key={index} disablePadding>
                                                <ListItemIcon sx={{minWidth: 30}}>
                                                    <ErrorIcon fontSize="small" color="error" />
                                                </ListItemIcon>
                                                <ListItemText primary={<Typography variant="caption">{err}</Typography>} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Alert>
                    )}

                    {!selectedFile && !isLoading && !importResult && !error && (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                            <T>expenseImport.noFileSelected</T>
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}
