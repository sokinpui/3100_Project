// src/modules/CustomReport/CustomReport.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Container, Card, CardHeader, CardContent, Box, Typography, Button,
    FormGroup, FormControlLabel, Checkbox, Grid, CircularProgress, Alert,
    FormControl, InputLabel, Select, MenuItem, Tooltip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import T from '../../utils/T';
import TimePeriodSelectorWidget from '../../modules/DynamicDashboard/widgets/TimePeriodSelectorWidget';

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

    // Default selection (e.g., expenses and income)
    const defaultSelection = ['expenses', 'income'];
    const [selectedDataTypes, setSelectedDataTypes] = useState(defaultSelection);
    const [selectedColumns, setSelectedColumns] = useState({});
    const [selectedPeriod, setSelectedPeriod] = useState({ startDate: null, endDate: null, presetKey: '' });
    const [outputFormat, setOutputFormat] = useState('csv');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Initialize selected columns based on the default selection
    useEffect(() => {
        const initialCols = {};
        defaultSelection.forEach(type => {
            if (AVAILABLE_DATA_TYPES[type]) {
                initialCols[type] = AVAILABLE_DATA_TYPES[type].cols;
            }
        });
        setSelectedColumns(initialCols);
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount based on initial defaultSelection

    const handlePeriodChange = useCallback((period) => {
        setSelectedPeriod(period);
        setError('');
    }, []);

    // --- IMPLEMENT THIS HANDLER ---
    const handleDataTypeChange = (event) => {
        const { name, checked } = event.target;

        setSelectedDataTypes(prevSelected => {
            let newSelected;
            if (checked) {
                // Add the type if it's not already there
                newSelected = [...prevSelected, name];
            } else {
                // Remove the type
                newSelected = prevSelected.filter(type => type !== name);
            }
            return newSelected;
        });

        // Also update selected columns state when type selection changes
        setSelectedColumns(prevColumns => {
            const newColumns = { ...prevColumns };
            if (checked) {
                // Add default columns if the type is added and exists in AVAILABLE_DATA_TYPES
                if (AVAILABLE_DATA_TYPES[name]) {
                     newColumns[name] = AVAILABLE_DATA_TYPES[name].cols;
                }
            } else {
                // Remove columns if the type is unchecked
                delete newColumns[name];
            }
            return newColumns;
        });

        // Clear error if user interacts
        if (error) setError('');
    };
    // --- END IMPLEMENTATION ---

    // handleColumnChange (Placeholder - keep as is or implement if needed)
    const handleColumnChange = (dataType, event) => {
        // Future: Implement logic to update selectedColumns[dataType]
        console.warn("Column selection not fully implemented yet.");
    };


    const handleGenerateReport = async () => {
        if (selectedDataTypes.length === 0) {
            // Use translation key
            setError(t('customReport.errorNoDataTypes'));
            return;
        }
        setIsLoading(true);
        setError('');

        const payload = {
            data_types: selectedDataTypes,
            start_date: selectedPeriod.startDate ? selectedPeriod.startDate.toISOString().split('T')[0] : null,
            end_date: selectedPeriod.endDate ? selectedPeriod.endDate.toISOString().split('T')[0] : null,
             // For now, always send the default columns based on selected types
             // Future: Send the actual selectedColumns state if implemented
            columns: Object.fromEntries(
                 selectedDataTypes
                    .filter(type => AVAILABLE_DATA_TYPES[type]) // Ensure type exists
                    .map(type => [type, AVAILABLE_DATA_TYPES[type].cols])
             ),
            // columns: selectedColumns, // Send this once column selection UI is done
            output_format: outputFormat,
        };

        try {
            const response = await axios.post(`${API_URL}/reports/${userId}/custom`, payload, {
                responseType: 'blob', // Important for file download
            });

            // File download logic
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
                // Use backend's detail message if provided
                setError(err.response.data.detail);
                setIsLoading(false);
                return; // Stop further processing
            }
            // Use translated error key
            setError(t(errorKey));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardHeader
                    // Use translated title
                    title={<T>customReport.title</T>}
                    sx={{ backgroundColor: 'info.light', color: 'info.contrastText', py: 1.5 }}
                />
                <CardContent>
                    {/* Use translated description */}
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        <T>customReport.description</T>
                    </Typography>

                    {/* Display translated error */}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Grid container spacing={3}>
                        {/* Data Type Selection */}
                        <Grid item xs={12} md={4}>
                            {/* Use translated subtitle */}
                            <Typography gutterBottom variant="subtitle1"><T>customReport.selectDataTypes</T></Typography>
                            <FormGroup>
                                {Object.entries(AVAILABLE_DATA_TYPES).map(([key, value]) => (
                                    <FormControlLabel
                                        key={key}
                                        control={
                                            <Checkbox
                                                // Ensure checked status reflects state
                                                checked={selectedDataTypes.includes(key)}
                                                // Ensure onChange handler is correctly passed
                                                onChange={handleDataTypeChange}
                                                name={key} // Name is crucial for the handler
                                                size="small"
                                            />
                                        }
                                        // Use translated label
                                        label={<T>{value.labelKey}</T>}
                                    />
                                ))}
                            </FormGroup>
                        </Grid>

                        {/* Date Range & Format */}
                        <Grid item xs={12} md={8}>
                             {/* Use translated subtitle */}
                            <Typography gutterBottom variant="subtitle1"><T>customReport.configureOptions</T></Typography>

                            <Box sx={{ mb: 2 }}>
                                <TimePeriodSelectorWidget onPeriodChange={handlePeriodChange} />
                            </Box>

                            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                {/* Use translated label */}
                                <InputLabel id="format-select-label"><T>customReport.outputFormat</T></InputLabel>
                                <Select
                                    labelId="format-select-label"
                                    value={outputFormat}
                                    // Use translated label
                                    label={t('customReport.outputFormat')}
                                    onChange={(e) => setOutputFormat(e.target.value)}
                                >
                                    <MenuItem value="csv">CSV (.csv)</MenuItem>
                                    <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                                    {/* PDF option can be added here when ready */}
                                    {/* <MenuItem value="pdf" disabled>PDF (.pdf) - Soon</MenuItem> */}
                                </Select>
                            </FormControl>

                            {/* Use translated note */}
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
                                {/* Use translated button text */}
                                <T>customReport.generateButton</T>
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
}
