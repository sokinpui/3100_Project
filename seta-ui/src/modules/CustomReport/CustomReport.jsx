// src/modules/CustomReport/CustomReport.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Container, Card, CardHeader, CardContent, Box, Typography, Button,
    FormGroup, FormControlLabel, Checkbox, Grid, CircularProgress, Alert,
    FormControl, InputLabel, Select, MenuItem, Tooltip
} from '@mui/material';
// Remove DatePicker and related imports if no longer needed elsewhere in this file
// import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
// import { startOfDay, endOfDay } from 'date-fns';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import T from '../../utils/T';
// --- ADD Import for the reusable widget ---
import TimePeriodSelectorWidget from '../../modules/DynamicDashboard/widgets/TimePeriodSelectorWidget';
// --- END ADD ---


const API_URL = 'http://localhost:8000';

// Define available data types (keep as is)
const AVAILABLE_DATA_TYPES = {
    expenses: { labelKey: 'common.Expenses', cols: ['date', 'category_name', 'amount', 'description'] },
    income: { labelKey: 'common.Income', cols: ['date', 'source', 'amount', 'description', 'account_id'] },
    accounts: { labelKey: 'sidebar.accounts', cols: ['name', 'account_type', 'starting_balance', 'balance_date', 'currency'] },
    recurring: { labelKey: 'sidebar.recurring', cols: ['name', 'category_name', 'amount', 'frequency', 'start_date', 'end_date', 'account_id'] },
    budgets: { labelKey: 'planningManager.budgetsTab', cols: ['category_name', 'amount_limit', 'period', 'start_date', 'end_date'] },
    goals: { labelKey: 'planningManager.goalsTab', cols: ['name', 'target_amount', 'current_amount', 'target_date'] },
};

export default function CustomReport() {
    const { t } = useTranslation();
    const userId = localStorage.getItem('userId');

    const [selectedDataTypes, setSelectedDataTypes] = useState(['expenses', 'income']);
    const [selectedColumns, setSelectedColumns] = useState({});
    // --- REMOVE individual date states ---
    // const [startDate, setStartDate] = useState(null);
    // const [endDate, setEndDate] = useState(null);
    // --- END REMOVE ---
    // --- ADD state for the period object ---
    const [selectedPeriod, setSelectedPeriod] = useState({ startDate: null, endDate: null, presetKey: '' }); // Initialize empty or based on selector's default
    // --- END ADD ---
    const [outputFormat, setOutputFormat] = useState('csv');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Initialize selected columns (keep as is)
    useEffect(() => {
        const initialCols = {};
        selectedDataTypes.forEach(type => {
            if (AVAILABLE_DATA_TYPES[type]) {
                initialCols[type] = AVAILABLE_DATA_TYPES[type].cols;
            }
        });
        setSelectedColumns(initialCols);
    }, [selectedDataTypes]); // Corrected dependency

    // --- ADD callback for TimePeriodSelectorWidget ---
    const handlePeriodChange = useCallback((period) => {
        // period object contains { startDate, endDate, presetKey }
        setSelectedPeriod(period);
        setError(''); // Clear error when period changes
    }, []);
    // --- END ADD ---

    // handleDataTypeChange (keep as is)
    const handleDataTypeChange = (event) => { /* ... */ };
    // handleColumnChange (keep as is)
    const handleColumnChange = (dataType, event) => { /* ... */ };

    const handleGenerateReport = async () => {
        if (selectedDataTypes.length === 0) {
            setError('customReport.errorNoDataTypes');
            return;
        }
        setIsLoading(true);
        setError('');

        // --- UPDATE payload to use selectedPeriod ---
        const payload = {
            data_types: selectedDataTypes,
            // Send null if startDate/endDate is null (e.g., for "All Time")
            start_date: selectedPeriod.startDate ? selectedPeriod.startDate.toISOString().split('T')[0] : null,
            end_date: selectedPeriod.endDate ? selectedPeriod.endDate.toISOString().split('T')[0] : null,
            columns: selectedColumns,
            output_format: outputFormat,
        };
        // --- END UPDATE ---

        try {
            const response = await axios.post(`${API_URL}/reports/${userId}/custom`, payload, {
                responseType: 'blob',
            });
            // ... (file download logic - keep as is) ...
             const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let filename = `seta_custom_report_${userId}.` + (outputFormat === 'excel' ? 'xlsx' : 'csv');
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error("Custom report generation error:", err.response?.data || err.message);
            let errorKey = 'customReport.errorGenerationFailed';
            if (err.response?.status === 403) errorKey = 'customReport.errorLicenceRequired';
            else if (err.response?.status === 404) errorKey = 'customReport.errorNoDataFound';
            else if (err.response?.data?.detail) {
                setError(err.response.data.detail); // Show raw detail if available
                setIsLoading(false);
                return;
            }
            setError(errorKey);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardHeader
                    title={<T>customReport.title</T>}
                    sx={{ backgroundColor: 'info.light', color: 'info.contrastText', py: 1.5 }}
                />
                <CardContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        <T>customReport.description</T>
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}</Alert>}

                    <Grid container spacing={3}>
                        {/* Data Type Selection */}
                        <Grid item xs={12} md={4}>
                            <Typography gutterBottom variant="subtitle1"><T>customReport.selectDataTypes</T></Typography>
                            <FormGroup>
                                {Object.entries(AVAILABLE_DATA_TYPES).map(([key, value]) => (
                                    <FormControlLabel
                                        key={key}
                                        control={ <Checkbox checked={selectedDataTypes.includes(key)} onChange={handleDataTypeChange} name={key} size="small" /> }
                                        label={<T>{value.labelKey}</T>}
                                    />
                                ))}
                            </FormGroup>
                        </Grid>

                        {/* Date Range & Format */}
                        <Grid item xs={12} md={8}>
                            <Typography gutterBottom variant="subtitle1"><T>customReport.configureOptions</T></Typography>

                            {/* --- REPLACE DatePickers with TimePeriodSelectorWidget --- */}
                            <Box sx={{ mb: 2 }}>
                                <TimePeriodSelectorWidget onPeriodChange={handlePeriodChange} />
                            </Box>
                            {/* --- END REPLACE --- */}

                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                <InputLabel id="format-select-label"><T>customReport.outputFormat</T></InputLabel>
                                <Select
                                    labelId="format-select-label"
                                    value={outputFormat}
                                    label={t('customReport.outputFormat')}
                                    onChange={(e) => setOutputFormat(e.target.value)}
                                >
                                    <MenuItem value="csv">CSV (.csv)</MenuItem>
                                    <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Column Selection Note */}
                             <Typography variant="caption" color="text.secondary">
                                <T>customReport.columnSelectionNote</T>
                             </Typography>
                        </Grid>

                        {/* Generate Button */}
                        <Grid item xs={12} sx={{ textAlign: 'right', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleGenerateReport}
                                disabled={isLoading || selectedDataTypes.length === 0}
                                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                            >
                                <T>customReport.generateButton</T>
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
}
