// src/modules/ExpenseReports.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import { getCategoryDetails } from '../constants';

const API_URL = 'http://localhost:8000';

// --- Helper Functions ---
const safeFormatDate = (dateString, formatStr = 'yyyy-MM-dd') => {
    if (!dateString) return '-';
    try {
        // Attempt to parse as ISO string first
        const date = parseISO(dateString);
        // Check if parsing was successful before formatting
        if (isNaN(date.getTime())) {
            // If ISO parsing fails, try creating a Date object directly (less reliable)
            const directDate = new Date(dateString);
            if (isNaN(directDate.getTime())) return dateString; // Return original if still invalid
            return format(directDate, formatStr);
        }
        return format(date, formatStr);
    } catch (e) {
        console.warn("Date formatting error for:", dateString, e);
        return dateString; // Fallback
    }
};

const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '-' : `$${num.toFixed(2)}`;
};
// --- End Helper Functions ---

export default function ExpenseReports() {
  const { t } = useTranslation();
  const userId = localStorage.getItem('userId');

  const [reportData, setReportData] = useState({
      expenses: [], income: [], recurring_expenses: [], budgets: [], goals: [], accounts: [], user_info: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async () => {
    if (!userId) {
        setError(t('expenseReports.errorLoading'));
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/reports/${userId}/all`);
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError(t('expenseReports.errorLoading'));
      setReportData({
          expenses: [], income: [], recurring_expenses: [], budgets: [], goals: [], accounts: [], user_info: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, t]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- CSV Headers ---
  const expenseHeaders = [
    { label: t('expenseManager.date'), key: 'date' },
    { label: t('expenseManager.category'), key: 'category_name' },
    { label: t('expenseManager.amount'), key: 'amount' },
    { label: t('expenseManager.description'), key: 'description' },
    { label: t('common.createdAt'), key: 'created_at' },
  ];
  const incomeHeaders = [
    { label: t('incomeManager.date'), key: 'date' },
    { label: t('incomeManager.source'), key: 'source' },
    { label: t('incomeManager.amount'), key: 'amount' },
    { label: t('incomeManager.description'), key: 'description' },
    { label: t('incomeManager.account'), key: 'account.name' },
    { label: t('common.createdAt'), key: 'created_at' },
  ];
  const recurringHeaders = [
    { label: t('recurringManager.name'), key: 'name' },
    { label: t('expenseManager.category'), key: 'category_name' },
    { label: t('recurringManager.amount'), key: 'amount' },
    { label: t('recurringManager.frequency'), key: 'frequency' },
    { label: t('recurringManager.startDate'), key: 'start_date' },
    { label: t('recurringManager.endDate'), key: 'end_date' },
    { label: t('recurringManager.account'), key: 'account.name' },
  ];
  const budgetHeaders = [
    { label: t('expenseManager.category'), key: 'category_name' },
    { label: t('budgetManager.amountLimit'), key: 'amount_limit' },
    { label: t('budgetManager.period'), key: 'period' },
    { label: t('budgetManager.startDate'), key: 'start_date' },
    { label: t('budgetManager.endDate'), key: 'end_date' },
  ];
  const goalHeaders = [
    { label: t('goalManager.goalName'), key: 'name' },
    { label: t('goalManager.targetAmount'), key: 'target_amount' },
    { label: t('goalManager.currentAmount'), key: 'current_amount' },
    { label: t('goalManager.targetDate'), key: 'target_date' },
  ];
  const accountHeaders = [
    { label: t('accountManager.accountName'), key: 'name' },
    { label: t('accountManager.accountType'), key: 'account_type' },
    { label: t('accountManager.startingBalance'), key: 'starting_balance' },
    { label: t('accountManager.balanceDate'), key: 'balance_date' },
    { label: 'Currency', key: 'currency' },
  ];

  // Data preparation for CSV
  const getCsvData = (dataType) => {
    const data = reportData[dataType] || [];
    if (dataType === 'income' || dataType === 'recurring_expenses') {
      const accountsMap = new Map(reportData.accounts.map(acc => [acc.id, acc.name]));
      return data.map(item => ({
        ...item,
        'account.name': item.account_id ? accountsMap.get(item.account_id) || 'N/A' : '',
        date: safeFormatDate(item.date),
        created_at: safeFormatDate(item.created_at, 'Pp'),
        amount: parseFloat(item.amount).toFixed(2),
      }));
    }
    if (dataType === 'budgets') {
      return data.map(item => ({
        ...item,
        category_name: getCategoryDetails(item.category_name) ? t(`expenseManager.category_${getCategoryDetails(item.category_name).key}`) : item.category_name,
        period: t(`recurringManager.frequency_${item.period}`),
        start_date: safeFormatDate(item.start_date),
        end_date: safeFormatDate(item.end_date),
        amount_limit: parseFloat(item.amount_limit).toFixed(2),
      }));
    }
    return data.map(item => ({
      ...item,
      date: safeFormatDate(item.date),
      created_at: safeFormatDate(item.created_at, 'Pp'),
      amount: item.amount ? parseFloat(item.amount).toFixed(2) : undefined,
    }));
  };

  // --- Excel Generation ---
  const generateExcel = () => {
    const wb = XLSX.utils.book_new();
    const accountsMap = new Map(reportData.accounts.map(acc => [acc.id, acc.name]));

    const addSheet = (sheetName, data, headers) => {
      const sheetData = data.map(item => {
        let row = {};
        headers.forEach(header => {
          const keys = header.key.split('.');
          let value = item;
          try {
            keys.forEach(k => { value = value[k]; });
          } catch {
            value = null;
          }
          if (header.key === 'account.name') {
            value = item.account_id ? accountsMap.get(item.account_id) || 'N/A' : '';
          } else if (header.key.includes('date')) {
            value = safeFormatDate(value);
          } else if (header.key.includes('amount') || header.key.includes('balance')) {
            value = parseFloat(value);
          } else if (header.key === 'category_name' && sheetName === 'Budgets') {
            value = getCategoryDetails(value) ? t(`expenseManager.category_${getCategoryDetails(value).key}`) : value;
          } else if (header.key === 'period' && sheetName === 'Budgets') {
            value = t(`recurringManager.frequency_${value}`);
          } else if (header.key === 'frequency' && sheetName === 'Recurring') {
            value = t(`recurringManager.frequency_${value}`);
          }
          row[header.label] = value ?? '';
        });
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    };

    if (reportData.expenses.length > 0) addSheet(t('common.Expenses'), reportData.expenses, expenseHeaders);
    if (reportData.income.length > 0) addSheet(t('common.Income'), reportData.income, incomeHeaders);
    if (reportData.recurring_expenses.length > 0) addSheet(t('sidebar.recurring'), reportData.recurring_expenses, recurringHeaders);
    if (reportData.budgets.length > 0) addSheet(t('planningManager.budgetsTab'), reportData.budgets, budgetHeaders);
    if (reportData.goals.length > 0) addSheet(t('planningManager.goalsTab'), reportData.goals, goalHeaders);
    if (reportData.accounts.length > 0) addSheet(t('sidebar.accounts'), reportData.accounts, accountHeaders);

    if (wb.SheetNames.length === 0) {
      alert(t('expenseReports.noDataToExport'));
      return;
    }

    XLSX.writeFile(wb, `seta_report_${safeFormatDate(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  // --- PDF Generation (Updated) ---
  const generatePDF = () => {
    const doc = new jsPDF();
    const accountsMap = new Map(reportData.accounts.map(acc => [acc.id, acc.name]));
    let tableDrawn = false;

    let currentY = 30;

    doc.setFontSize(16);
    doc.text(t('expenseReports.title'), 14, 20);
    if (reportData.user_info) {
      doc.setFontSize(10);
      doc.text(`User: ${reportData.user_info.first_name} ${reportData.user_info.last_name} (${reportData.user_info.email})`, 14, 26);
      currentY = 32;
    }

    const addTableToPdf = (titleKey, data, headers) => {
      if (!data || data.length === 0) return;

      if (tableDrawn) {
        currentY += 10;
      }

      const estimatedHeight = 15 + (data.length * 5) + 10;
      if (currentY + estimatedHeight > doc.internal.pageSize.height - 20) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12);
      doc.text(t(titleKey), 14, currentY);
      currentY += 6;

      const tableData = data.map(item => headers.map(header => {
        const keys = header.key.split('.');
        let value = item;
        try { keys.forEach(k => { value = value[k]; }); } catch { value = null; }
        if (header.key === 'account.name') return item.account_id ? accountsMap.get(item.account_id) || 'N/A' : '-';
        if (header.key.includes('date')) return safeFormatDate(value);
        if (header.key.includes('amount') || header.key.includes('balance')) return formatCurrency(value);
        if (header.key === 'category_name' && titleKey === 'planningManager.budgetsTab') return getCategoryDetails(value) ? t(`expenseManager.category_${getCategoryDetails(value).key}`) : value;
        if (header.key === 'period' && titleKey === 'planningManager.budgetsTab') return t(`recurringManager.frequency_${value}`);
        if (header.key === 'frequency' && titleKey === 'sidebar.recurring') return t(`recurringManager.frequency_${value}`);
        return value ?? '-';
      }));

      autoTable(doc, {
        startY: currentY,
        head: [headers.map(h => h.label)],
        body: tableData,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: { fillColor: [25, 118, 210], fontSize: 7 },
        didDrawPage: (data) => {
          currentY = data.cursor.y;
        }
      });

      if (doc.lastAutoTable?.finalY) {
        currentY = doc.lastAutoTable.finalY;
        tableDrawn = true;
      }
    };

    addTableToPdf('common.Expenses', reportData.expenses, expenseHeaders);
    addTableToPdf('common.Income', reportData.income, incomeHeaders);
    addTableToPdf('sidebar.recurring', reportData.recurring_expenses, recurringHeaders);
    addTableToPdf('planningManager.budgetsTab', reportData.budgets, budgetHeaders);
    addTableToPdf('planningManager.goalsTab', reportData.goals, goalHeaders);
    addTableToPdf('sidebar.accounts', reportData.accounts, accountHeaders);

    if (!tableDrawn) {
      alert(t('expenseReports.noDataToExport'));
      return;
    }

    doc.save(`seta_report_${safeFormatDate(new Date(), 'yyyyMMdd')}.pdf`);
  };

  // --- Get Total Record Count ---
  const totalRecords = Object.values(reportData)
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
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}

          <Typography variant="body1" sx={{ mb: 3 }}>
            <T>expenseReports.descriptionMultipleFormats</T>
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}><T>expenseReports.loading</T></Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <T>expenseReports.totalRecords</T> {totalRecords}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={generateExcel}>
                    <T>expenseReports.downloadExcel</T> (All Data)
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button fullWidth variant="contained" startIcon={<DownloadIcon />} onClick={generatePDF}>
                    <T>expenseReports.downloadPDF</T> (All Data)
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }}><Typography variant="overline">Download Individual CSV</Typography></Divider>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={4} md={3}>
                  <CSVLink data={getCsvData('expenses')} headers={expenseHeaders} filename={`expenses_report_${safeFormatDate(new Date(), 'yyyyMMdd')}.csv`} style={{ textDecoration: 'none' }}>
                    <Button fullWidth variant="outlined" size="small" startIcon={<DownloadIcon />} disabled={!reportData.expenses?.length}> <T>common.Expenses</T> CSV </Button>
                  </CSVLink>
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <CSVLink data={getCsvData('income')} headers={incomeHeaders} filename={`income_report_${safeFormatDate(new Date(), 'yyyyMMdd')}.csv`} style={{ textDecoration: 'none' }}>
                    <Button fullWidth variant="outlined" size="small" startIcon={<DownloadIcon />} disabled={!reportData.income?.length}> <T>common.Income</T> CSV </Button>
                  </CSVLink>
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <CSVLink data={getCsvData('recurring_expenses')} headers={recurringHeaders} filename={`recurring_report_${safeFormatDate(new Date(), 'yyyyMMdd')}.csv`} style={{ textDecoration: 'none' }}>
                    <Button fullWidth variant="outlined" size="small" startIcon={<DownloadIcon />} disabled={!reportData.recurring_expenses?.length}> <T>sidebar.recurring</T> CSV </Button>
                  </CSVLink>
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <CSVLink data={getCsvData('budgets')} headers={budgetHeaders} filename={`budgets_report_${safeFormatDate(new Date(), 'yyyyMMdd')}.csv`} style={{ textDecoration: 'none' }}>
                    <Button fullWidth variant="outlined" size="small" startIcon={<DownloadIcon />} disabled={!reportData.budgets?.length}> <T>planningManager.budgetsTab</T> CSV </Button>
                  </CSVLink>
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <CSVLink data={getCsvData('goals')} headers={goalHeaders} filename={`goals_report_${safeFormatDate(new Date(), 'yyyyMMdd')}.csv`} style={{ textDecoration: 'none' }}>
                    <Button fullWidth variant="outlined" size="small" startIcon={<DownloadIcon />} disabled={!reportData.goals?.length}> <T>planningManager.goalsTab</T> CSV </Button>
                  </CSVLink>
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <CSVLink data={getCsvData('accounts')} headers={accountHeaders} filename={`accounts_report_${safeFormatDate(new Date(), 'yyyyMMdd')}.csv`} style={{ textDecoration: 'none' }}>
                    <Button fullWidth variant="outlined" size="small" startIcon={<DownloadIcon />} disabled={!reportData.accounts?.length}> <T>sidebar.accounts</T> CSV </Button>
                  </CSVLink>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
