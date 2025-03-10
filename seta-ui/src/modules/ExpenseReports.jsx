import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
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

export default function ExpenseReports() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get userId from localStorage (set during login)
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchExpenses();
  }, [userId]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/expenses/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
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

  return (
    <Container maxWidth="lg">
      <Card elevation={3} sx={{ mt: 4, borderRadius: 2 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TableChartIcon sx={{ mr: 1 }} />
              Expense Reports
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
              {error}
            </Alert>
          )}

          <Typography variant="body1" sx={{ mb: 3 }}>
            Download your expense history as a CSV file. The report includes all your recorded expenses
            with details such as date, category, amount, and description.
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Total Records: {expenses.length}
              </Typography>
              
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
                  Download Expense Report
                </Button>
              </CSVLink>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}