// src/modules/ExpenseReports.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container, Card, CardContent, CardHeader, Button, Typography, Box,
  CircularProgress, Alert, Grid, Divider,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import T from '../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
// getCategoryDetails might not be needed if all formatting/translation happens backend or is not part of this specific report.
// For now, keeping it in case it's used elsewhere or for button text.
import { getCategoryDetails } from '../constants';

const API_URL = 'http://localhost:8000';

// Define all data types available for the comprehensive report
const ALL_REPORT_DATA_TYPES = ['expenses', 'income', 'recurring', 'budgets', 'goals', 'accounts'];

// Define labels for individual download buttons (maps internal key to translation key)
const INDIVIDUAL_DATA_TYPE_OPTIONS = {
    expenses: { labelKey: 'common.Expenses' },
    income: { labelKey: 'common.Income' },
    recurring_expenses: { labelKey: 'sidebar.recurring', backendKey: 'recurring' }, // Map frontend key to backend key
    budgets: { labelKey: 'planningManager.budgetsTab' },
    goals: { labelKey: 'planningManager.goalsTab' },
    accounts: { labelKey: 'sidebar.accounts' },
};


// --- Helper Functions ---
const safeFormatDate = (dateString, formatStr = 'yyyy-MM-dd') => {
    if (!dateString) return '-';
    try {
        const date = parseISO(dateString);
        if (isNaN(date.getTime())) {
            const directDate = new Date(dateString);
            if (isNaN(directDate.getTime())) return dateString;
            return format(directDate, formatStr);
        }
        return format(date, formatStr);
    } catch (e) {
        console.warn("Date formatting error for:", dateString, e);
        return dateString;
    }
};

// This might not be needed if backend handles all currency formatting in reports
// const formatCurrency = (value) => {
//     const num = parseFloat(value);
//     return isNaN(num) ? '-' : `$${num.toFixed(2)}`;
// };
// --- End Helper Functions ---

export default function ExpenseReports() {
  const { t } = useTranslation();
  const userId = localStorage.getItem('userId');

  // State for initial data load (e.g., for total counts, disabling buttons)
  const [reportSummaryData, setReportSummaryData] = useState({
      expenses: [], income: [], recurring_expenses: [], budgets: [], goals: [], accounts: [], user_info: null,
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // State for download operations
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);


  const fetchReportSummary = useCallback(async () => {
    if (!userId) {
        setSummaryError(t('expenseReports.errorLoading'));
        setIsLoadingSummary(false);
        return;
    }
    setIsLoadingSummary(true);
    setSummaryError(null);
    try {
      // This endpoint fetches summary data, used for record counts and disabling buttons.
      // The actual file downloads will use the /custom endpoint.
      const response = await axios.get(`${API_URL}/reports/${userId}/all`);
      setReportSummaryData(response.data);
    } catch (error) {
      console.error('Error fetching report summary data:', error);
      setSummaryError(t('expenseReports.errorLoading'));
      setReportSummaryData({ // Reset on error
          expenses: [], income: [], recurring_expenses: [], budgets: [], goals: [], accounts: [], user_info: null,
      });
    } finally {
      setIsLoadingSummary(false);
    }
  }, [userId, t]);

  useEffect(() => {
    fetchReportSummary();
  }, [fetchReportSummary]);

  const handleDownload = async (outputFormat, dataTypesToRequest, specificFileNamePart = 'all_data') => {
    if (!userId) {
        setDownloadError(t('expenseReports.errorUserNotIdentified'));
        return;
    }
    setIsDownloading(true);
    setDownloadError(null);

    const payload = {
        data_types: dataTypesToRequest,
        start_date: null, // No date range for general reports
        end_date: null,
        columns: {}, // Let backend use default columns
        output_format: outputFormat,
    };

    try {
        const response = await axios.post(`${API_URL}/reports/${userId}/custom`, payload, {
            responseType: 'blob', // Important for file download
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const contentDisposition = response.headers['content-disposition'];
        let filename = `seta_report_${specificFileNamePart}_${safeFormatDate(new Date(), 'yyyyMMdd')}.${outputFormat === 'excel' ? 'xlsx' : outputFormat}`;
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
        console.error("Report generation error:", err.response?.data || err.message);
        let errorKey = 'customReport.errorGenerationFailed'; // Using key from CustomReport for consistency
        if (err.response?.status === 403) errorKey = 'customReport.errorLicenceRequired';
        else if (err.response?.status === 404) errorKey = 'customReport.errorNoDataFound';
        else if (err.response?.data) {
            // Try to parse blob error for JSON content
            try {
                const errorObj = JSON.parse(await err.response.data.text());
                setDownloadError(errorObj.detail || t(errorKey));
            } catch (parseError) {
                setDownloadError(t(errorKey));
            }
            setIsDownloading(false);
            return;
        }
        setDownloadError(t(errorKey));
    } finally {
        setIsDownloading(false);
    }
  };


  const totalRecords = Object.values(reportSummaryData)
    .filter(Array.isArray)
    .reduce((sum, arr) => sum + (arr?.length || 0), 0);

  return (
    <Container maxWidth="lg">
      <Card elevation={3} sx={{ mt: 4, borderRadius: 2 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1 }} />
              <T>expenseReports.title</T>
            </Box>
          }
          sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText', py: 1.5 }}
        />
        <CardContent>
          {summaryError && (
            <Alert severity="error" sx={{ mb: 2 }}>{summaryError}</Alert>
          )}
          {downloadError && (
            <Alert severity="error" sx={{ mb: 2 }}>{downloadError}</Alert>
          )}

          <Typography variant="body1" sx={{ mb: 3 }}>
            <T>expenseReports.descriptionMultipleFormats</T>
          </Typography>

          {isLoadingSummary ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}><T>expenseReports.loading</T></Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <T>expenseReports.totalRecords</T> {totalRecords}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                    onClick={() => handleDownload('csv', ALL_REPORT_DATA_TYPES, 'all_data')}
                    disabled={isDownloading || totalRecords === 0}
                  >
                    <T>expenseReports.downloadCsvAll</T>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                    onClick={() => handleDownload('excel', ALL_REPORT_DATA_TYPES, 'all_data')}
                    disabled={isDownloading || totalRecords === 0}
                  >
                    <T>expenseReports.downloadExcelAll</T>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                    onClick={() => handleDownload('pdf', ALL_REPORT_DATA_TYPES, 'all_data')}
                    disabled={isDownloading || totalRecords === 0}
                  >
                    <T>expenseReports.downloadPdfAll</T>
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }}><Typography variant="overline"><T>expenseReports.downloadIndividualCsv</T></Typography></Divider>

              <Grid container spacing={2}>
                {Object.entries(INDIVIDUAL_DATA_TYPE_OPTIONS).map(([key, config]) => {
                  const reportDataKey = key; // e.g., 'expenses', 'recurring_expenses'
                  const backendDataType = config.backendKey || key; // e.g., 'expenses', 'recurring'
                  const dataArray = reportSummaryData[reportDataKey];
                  const hasData = dataArray && dataArray.length > 0;

                  return (
                    <Grid item xs={6} sm={4} md={3} key={key}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={isDownloading ? <CircularProgress size={16} /> : <DownloadIcon />}
                        onClick={() => handleDownload('csv', [backendDataType], backendDataType)}
                        disabled={isDownloading || !hasData}
                      >
                        <T>{config.labelKey}</T> CSV
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
