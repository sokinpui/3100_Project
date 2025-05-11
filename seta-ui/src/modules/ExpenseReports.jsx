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

const API_URL = 'http://localhost:8000';

// Define all data types available for the comprehensive report (backend keys)
const ALL_REPORT_DATA_TYPES_BACKEND = ['expenses', 'income', 'recurring', 'budgets', 'goals', 'accounts'];

// Define labels for individual download buttons
// Maps frontend key (used for summary data access) to translation key and backend data type key
const INDIVIDUAL_DATA_TYPE_OPTIONS = {
    expenses: { labelKey: 'common.Expenses', backendKey: 'expenses' },
    income: { labelKey: 'common.Income', backendKey: 'income' },
    recurring_expenses: { labelKey: 'sidebar.recurring', backendKey: 'recurring' },
    budgets: { labelKey: 'planningManager.budgetsTab', backendKey: 'budgets' },
    goals: { labelKey: 'planningManager.goalsTab', backendKey: 'goals' },
    accounts: { labelKey: 'sidebar.accounts', backendKey: 'accounts' },
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
// --- End Helper Functions ---

export default function ExpenseReports() {
  const { t } = useTranslation();
  const userId = localStorage.getItem('userId');

  const [reportSummaryData, setReportSummaryData] = useState({
      expenses: [], income: [], recurring_expenses: [], budgets: [], goals: [], accounts: [], user_info: null,
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);


  const fetchReportSummary = useCallback(async () => {
    if (!userId) {
        setSummaryError(t('expenseReports.errorUserNotIdentified'));
        setIsLoadingSummary(false);
        return;
    }
    setIsLoadingSummary(true);
    setSummaryError(null);
    try {
      // Use the new UNLICENSED summary endpoint
      const response = await axios.get(`${API_URL}/reports/${userId}/general_summary`);
      setReportSummaryData(response.data);
    } catch (error) {
      console.error('Error fetching report summary data:', error);
      let errorMsg = t('expenseReports.errorLoading');
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      setSummaryError(errorMsg);
      setReportSummaryData({
          expenses: [], income: [], recurring_expenses: [], budgets: [], goals: [], accounts: [], user_info: null,
      });
    } finally {
      setIsLoadingSummary(false);
    }
  }, [userId, t]);

  useEffect(() => {
    fetchReportSummary();
  }, [fetchReportSummary]);

  const handleDownload = async (outputFormat, dataTypesToRequest, specificFileNamePart = 'data') => {
    if (!userId) {
        setDownloadError(t('expenseReports.errorUserNotIdentified'));
        return;
    }
    setIsDownloading(true);
    setDownloadError(null);

    const payload = {
        data_types: dataTypesToRequest, // Array of backend data type keys
        start_date: null,
        end_date: null,
        columns: {}, // Backend will use default columns for this unlicensed endpoint
        output_format: outputFormat,
    };

    try {
        // Use the new UNLICENSED output endpoint
        const response = await axios.post(`${API_URL}/reports/${userId}/custom_unlicensed_output`, payload, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const contentDisposition = response.headers['content-disposition'];
        // Filename construction will now be primarily driven by backend's Content-Disposition
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
        console.error("Report generation error:", err);
        let errorKey = 'customReport.errorGenerationFailed';
        let detailMsg = '';
        if (err.response) {
            if (err.response.status === 404) errorKey = 'customReport.errorNoDataFound';
            // Try to parse blob error for JSON content if it's a blob
            if (err.response.data instanceof Blob && err.response.data.type === "application/json") {
                try {
                    const errorObj = JSON.parse(await err.response.data.text());
                    detailMsg = errorObj.detail;
                } catch (parseError) {
                    // Blob wasn't JSON or failed to parse
                }
            } else if (err.response.data?.detail) { // Standard JSON error
                 detailMsg = err.response.data.detail;
            }
        }
        setDownloadError(detailMsg || t(errorKey));
    } finally {
        setIsDownloading(false);
    }
  };

  // Calculate total records based on the keys present in INDIVIDUAL_DATA_TYPE_OPTIONS
  // and their corresponding arrays in reportSummaryData
  const totalRecords = Object.keys(INDIVIDUAL_DATA_TYPE_OPTIONS)
    .reduce((sum, frontendKey) => {
        const dataArray = reportSummaryData[frontendKey];
        return sum + (Array.isArray(dataArray) ? dataArray.length : 0);
    }, 0);


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
                    onClick={() => handleDownload('csv', ALL_REPORT_DATA_TYPES_BACKEND, 'all_data')}
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
                    onClick={() => handleDownload('excel', ALL_REPORT_DATA_TYPES_BACKEND, 'all_data')}
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
                    onClick={() => handleDownload('pdf', ALL_REPORT_DATA_TYPES_BACKEND, 'all_data')}
                    disabled={isDownloading || totalRecords === 0}
                  >
                    <T>expenseReports.downloadPdfAll</T>
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }}><Typography variant="overline"><T>expenseReports.downloadIndividualCsv</T></Typography></Divider>

              <Grid container spacing={2}>
                {Object.entries(INDIVIDUAL_DATA_TYPE_OPTIONS).map(([frontendKey, config]) => {
                  const dataArray = reportSummaryData[frontendKey]; // Use frontendKey to access summary data
                  const hasData = dataArray && dataArray.length > 0;

                  return (
                    <Grid item xs={6} sm={4} md={3} key={frontendKey}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={isDownloading ? <CircularProgress size={16} /> : <DownloadIcon />}
                        // Pass the backendKey for the API request
                        onClick={() => handleDownload('csv', [config.backendKey], config.backendKey)}
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
