// src/modules/ExpenseImport/ExpenseImport.jsx
import React, { useState, useRef, useCallback } from 'react';
import {
    Container, Card, CardHeader, CardContent, Button, Box, Typography,
    LinearProgress, Alert, List, ListItem, ListItemText, ListItemIcon, Chip, Grid // Added Grid
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ErrorIcon from '@mui/icons-material/Error';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import T from '../../utils/T';
import ImportExportIcon from '@mui/icons-material/ImportExport'; // Added for main title

const API_URL = 'http://localhost:8000';

export default function ExpenseImport() { // Consider renaming component later if scope expands further
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');

    // --- Expense Import State ---
    const expenseFileInputRef = useRef(null);
    const [selectedExpenseFile, setSelectedExpenseFile] = useState(null);
    const [isExpenseLoading, setIsExpenseLoading] = useState(false);
    const [expenseError, setExpenseError] = useState(null);
    const [expenseImportResult, setExpenseImportResult] = useState(null);

    // --- Income Import State ---
    const incomeFileInputRef = useRef(null); // Separate ref for income input
    const [selectedIncomeFile, setSelectedIncomeFile] = useState(null);
    const [isIncomeLoading, setIsIncomeLoading] = useState(false);
    const [incomeError, setIncomeError] = useState(null);
    const [incomeImportResult, setIncomeImportResult] = useState(null);


    // --- Expense Handlers ---
    const handleExpenseFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            setSelectedExpenseFile(file);
            setExpenseError(null);
            setExpenseImportResult(null);
        } else {
            setSelectedExpenseFile(null);
            setExpenseError(t('expenseImport.invalidFileType'));
        }
        // Clear the other file input if one is selected
        setSelectedIncomeFile(null);
        setIncomeError(null);
        setIncomeImportResult(null);
        if (incomeFileInputRef.current) incomeFileInputRef.current.value = '';
    };

    const handleExpenseButtonClick = () => {
        // Reset input value to allow re-selecting the same file
        if (expenseFileInputRef.current) expenseFileInputRef.current.value = '';
        expenseFileInputRef.current?.click();
    };

    const handleExpenseUpload = useCallback(async () => {
        if (!selectedExpenseFile || !userId) return;

        setIsExpenseLoading(true);
        setExpenseError(null);
        setExpenseImportResult(null);

        const formData = new FormData();
        formData.append('file', selectedExpenseFile);

        try {
            const response = await axios.post(
                `${API_URL}/expenses/import/${userId}`,
                formData, { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setExpenseImportResult(response.data);
            setSelectedExpenseFile(null);
        } catch (err) {
            console.error("Expense Import API error:", err.response?.data || err.message);
            const apiError = err.response?.data?.detail || t('expenseImport.apiError');
            setExpenseError(apiError);
            setExpenseImportResult(null);
        } finally {
            setIsExpenseLoading(false);
        }
    }, [selectedExpenseFile, userId, t]);

    // --- Income Handlers ---
    const handleIncomeFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            setSelectedIncomeFile(file);
            setIncomeError(null);
            setIncomeImportResult(null);
        } else {
            setSelectedIncomeFile(null);
            // Use a specific income error key if needed, or reuse generic one
            setIncomeError(t('expenseImport.invalidFileType')); // Reusing for now
        }
         // Clear the other file input if one is selected
        setSelectedExpenseFile(null);
        setExpenseError(null);
        setExpenseImportResult(null);
        if (expenseFileInputRef.current) expenseFileInputRef.current.value = '';
    };

     const handleIncomeButtonClick = () => {
         // Reset input value
        if (incomeFileInputRef.current) incomeFileInputRef.current.value = '';
        incomeFileInputRef.current?.click();
    };

     const handleIncomeUpload = useCallback(async () => {
        if (!selectedIncomeFile || !userId) return;

        setIsIncomeLoading(true);
        setIncomeError(null);
        setIncomeImportResult(null);

        const formData = new FormData();
        formData.append('file', selectedIncomeFile);

        try {
            // Use the NEW income import endpoint
            const response = await axios.post(
                `${API_URL}/income/import/${userId}`, // New Endpoint
                formData, { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setIncomeImportResult(response.data);
            setSelectedIncomeFile(null);
        } catch (err) {
            console.error("Income Import API error:", err.response?.data || err.message);
             // Use specific income error key if needed
            const apiError = err.response?.data?.detail || t('incomeImport.apiError'); // Reusing generic key for now
            setIncomeError(apiError);
            setIncomeImportResult(null);
        } finally {
            setIsIncomeLoading(false);
        }
    }, [selectedIncomeFile, userId, t]);


    return (
        // Maybe rename Container's purpose later, e.g., Data Import
        <Container maxWidth="md" sx={{ py: 4 }}>
             {/* Optional: Add a main title for the whole page */}
             <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ImportExportIcon sx={{ mr: 1 }} /> Data Import
             </Typography>

             {/* Grid container to hold the two cards */}
             <Grid container spacing={4}>

                {/* --- Expense Import Card --- */}
                <Grid item xs={12}>
                    <Card elevation={3} sx={{ borderRadius: 2 }}>
                        <CardHeader
                            title={<T>expenseImport.title</T>}
                            sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', py: 1.5 }}
                        />
                        <CardContent>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <T>expenseImport.description</T>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                <T>expenseImport.requiredHeadersInfo</T>
                                <Box component="span" sx={{ fontWeight: 'bold' }}> date, amount, category_name</Box>.
                                <T>expenseImport.optionalHeadersInfo</T>
                                <Box component="span" sx={{ fontWeight: 'bold' }}> description</Box>.
                                <T>expenseImport.dateFormatInfo</T>
                                <Box component="span" sx={{ fontWeight: 'bold' }}> YYYY-MM-DD</Box>.
                            </Typography>

                            {/* Hidden file input for expenses */}
                            <input
                                type="file" accept=".csv" ref={expenseFileInputRef}
                                onChange={handleExpenseFileChange} style={{ display: 'none' }}
                                id="expense-csv-upload-input"
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                <Button variant="outlined" startIcon={<UploadFileIcon />}
                                    onClick={handleExpenseButtonClick} disabled={isExpenseLoading || isIncomeLoading}>
                                    <T>expenseImport.selectFile</T>
                                </Button>
                                {selectedExpenseFile && (
                                    <Chip label={selectedExpenseFile.name} onDelete={() => setSelectedExpenseFile(null)} disabled={isExpenseLoading || isIncomeLoading} />
                                )}
                                <Button variant="contained" onClick={handleExpenseUpload}
                                    disabled={!selectedExpenseFile || isExpenseLoading || isIncomeLoading} sx={{ ml: 'auto' }}>
                                    {isExpenseLoading ? t('expenseImport.processing') : t('expenseImport.uploadAndProcess')}
                                </Button>
                            </Box>

                            {isExpenseLoading && <LinearProgress sx={{ mb: 2 }} />}
                            {expenseError && <Alert severity="error" sx={{ mb: 2 }}>{expenseError}</Alert>}
                            {expenseImportResult && (
                                <Alert severity={expenseImportResult.errors?.length > 0 ? "warning" : "success"} sx={{ mb: 2 }}>
                                    <Typography fontWeight="bold">{expenseImportResult.message}</Typography>
                                    <Typography variant="body2">{t('expenseImport.importedCount', { count: expenseImportResult.imported_count })}</Typography>
                                    {expenseImportResult.skipped_rows?.length > 0 && <Typography variant="body2">{t('expenseImport.skippedCount', { count: expenseImportResult.skipped_rows.length })}</Typography>}
                                    {expenseImportResult.errors?.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" fontWeight="bold">Errors:</Typography>
                                            <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                                                {expenseImportResult.errors.map((err, index) => (
                                                    <ListItem key={index} disablePadding>
                                                        <ListItemIcon sx={{minWidth: 30}}><ErrorIcon fontSize="small" color="error" /></ListItemIcon>
                                                        <ListItemText primary={<Typography variant="caption">{err}</Typography>} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </Alert>
                            )}
                            {!selectedExpenseFile && !isExpenseLoading && !expenseImportResult && !expenseError && !selectedIncomeFile && ( // Also check income file
                                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                                    <T>expenseImport.noFileSelected</T>
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                 {/* --- Income Import Card --- */}
                 <Grid item xs={12}>
                    <Card elevation={3} sx={{ borderRadius: 2 }}>
                        <CardHeader
                            // TODO: Add translation key 'incomeImport.title'
                            title={<T>incomeImport.title</T>}
                            // Use a different color for income card header
                            sx={{ backgroundColor: 'success.light', color: 'success.contrastText', py: 1.5 }}
                        />
                        <CardContent>
                             {/* TODO: Add translation key 'incomeImport.description' */}
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                <T>incomeImport.description</T>
                            </Typography>
                             {/* TODO: Add specific translation keys for income instructions */}
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                <T>incomeImport.requiredHeadersInfo</T>
                                <Box component="span" sx={{ fontWeight: 'bold' }}> date, amount, source</Box>.
                                <T>incomeImport.optionalHeadersInfo</T>
                                <Box component="span" sx={{ fontWeight: 'bold' }}> description, account_id</Box>.
                                <T>incomeImport.dateFormatInfo</T>
                                <Box component="span" sx={{ fontWeight: 'bold' }}> YYYY-MM-DD</Box>.
                            </Typography>

                             {/* Hidden file input for income */}
                            <input
                                type="file" accept=".csv" ref={incomeFileInputRef}
                                onChange={handleIncomeFileChange} style={{ display: 'none' }}
                                id="income-csv-upload-input" // Different ID
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                <Button variant="outlined" startIcon={<UploadFileIcon />}
                                    onClick={handleIncomeButtonClick} disabled={isIncomeLoading || isExpenseLoading}>
                                     {/* TODO: Add translation key 'incomeImport.selectFile' */}
                                    <T>incomeImport.selectFile</T>
                                </Button>
                                {selectedIncomeFile && (
                                    <Chip label={selectedIncomeFile.name} onDelete={() => setSelectedIncomeFile(null)} disabled={isIncomeLoading || isExpenseLoading} />
                                )}
                                <Button variant="contained" color="success" onClick={handleIncomeUpload}
                                    disabled={!selectedIncomeFile || isIncomeLoading || isExpenseLoading} sx={{ ml: 'auto' }}>
                                    {/* TODO: Add translation keys */}
                                    {isIncomeLoading ? t('incomeImport.processing') : t('incomeImport.uploadAndProcess')}
                                </Button>
                            </Box>

                            {isIncomeLoading && <LinearProgress color="success" sx={{ mb: 2 }} />}
                            {incomeError && <Alert severity="error" sx={{ mb: 2 }}>{incomeError}</Alert>}
                            {incomeImportResult && (
                                <Alert severity={incomeImportResult.errors?.length > 0 ? "warning" : "success"} sx={{ mb: 2 }}>
                                    <Typography fontWeight="bold">{incomeImportResult.message}</Typography>
                                     {/* TODO: Add specific translation keys */}
                                    <Typography variant="body2">{t('incomeImport.importedCount', { count: incomeImportResult.imported_count })}</Typography>
                                    {incomeImportResult.skipped_rows?.length > 0 && <Typography variant="body2">{t('incomeImport.skippedCount', { count: incomeImportResult.skipped_rows.length })}</Typography>}
                                    {incomeImportResult.errors?.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="caption" fontWeight="bold">Errors:</Typography>
                                            <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                                                {incomeImportResult.errors.map((err, index) => (
                                                    <ListItem key={index} disablePadding>
                                                        <ListItemIcon sx={{minWidth: 30}}><ErrorIcon fontSize="small" color="error" /></ListItemIcon>
                                                        <ListItemText primary={<Typography variant="caption">{err}</Typography>} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}
                                </Alert>
                            )}
                             {!selectedIncomeFile && !isIncomeLoading && !incomeImportResult && !incomeError && !selectedExpenseFile &&( // Also check expense file
                                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                                     {/* TODO: Add translation key */}
                                    <T>incomeImport.noFileSelected</T>
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                 </Grid>

             </Grid> {/* End Grid container */}
        </Container>
    );
}
