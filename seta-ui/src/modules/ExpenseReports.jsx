import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import T from '../utils/T'; // Adjust path based on your project structure

export default function ExpenseReports() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchExpenses();
  }, [userId]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/expenses/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const headers = [
    { label: 'Date', key: 'date' },
    { label: 'Category', key: 'category_name' },
    { label: 'Amount', key: 'amount' },
    { label: 'Description', key: 'description' },
    { label: 'Created At', key: 'created_at' },
  ];

  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(expenses);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
    XLSX.writeFile(workbook, `expense_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Expense Report', 14, 20);

    const tableData = expenses.map(exp => [
      exp.date,
      exp.category_name,
      exp.amount,
      exp.description || '-',
      new Date(exp.created_at).toLocaleString()
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Category', 'Amount', 'Description', 'Created At']],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
    });

    doc.save(`expense_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Container maxWidth="lg">
      <Card elevation={3} sx={{ mt: 4, borderRadius: 2 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TableChartIcon sx={{ mr: 1 }} />
              <T>expenseReports.title</T>
            </Box>
          }
          sx={{
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
            py: 1.5
          }}
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <T>{error}</T>
            </Alert>
          )}

          <Typography variant="body1" sx={{ mb: 3 }}>
            <T>expenseReports.description</T>
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>
                <T>expenseReports.loading</T>
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <T>expenseReports.totalRecords</T> {expenses.length}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <CSVLink
                  data={expenses}
                  headers={headers}
                  filename={`expense_report_${new Date().toISOString().split('T')[0]}.csv`}
                  style={{ textDecoration: 'none' }}
                >
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 'medium',
                      boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <T>CSV</T>
                  </Button>
                </CSVLink>

                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={generateExcel}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'medium',
                    boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <T>Excel</T>
                </Button>

                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={generatePDF}
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 'medium',
                    boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 15px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <T>PDF</T>
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
