// src/modules/DynamicDashboard/widgets/OverviewSummaryWidget.jsx
import React from 'react';
import { Box, Typography, CircularProgress, Grid, Paper } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment'; // For Expenses
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // For Income
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // For Net Flow
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // For Entries (could use ListAltIcon too)
import T from '../../../utils/T';
import { useTheme } from '@mui/material/styles'; // To get theme for colors

export function OverviewSummaryWidget({ expenses = [], income = [], isLoading }) {
  const theme = useTheme(); // Get theme object

  // Calculate Totals
  const totalExpenses = expenses
    .reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
  const totalIncome = income // Use the income prop
    .reduce((sum, inc) => sum + (parseFloat(inc.amount) || 0), 0);
  const netFlow = totalIncome - totalExpenses;

  // Calculate Counts
  const totalExpenseEntries = expenses.length;
  const totalIncomeEntries = income.length; // Count income entries

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

  const formatValue = (value) => `$${value.toFixed(2)}`;

  const getNetFlowColor = () => {
    if (netFlow > 0) return theme.palette.success.main;
    if (netFlow < 0) return theme.palette.error.main;
    return theme.palette.text.primary; // Neutral color for zero
  };

  return (
    // Use Grid container for better spacing and responsiveness
    <Grid container spacing={1} sx={{ height: '100%', alignItems: 'stretch', p: 1 }}>

      {/* Total Expenses */}
      <Grid item xs={6} md={6}> {/* Adjusted grid size */}
        <Paper variant="outlined" sx={{ textAlign: 'center', p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'action.hover' }}>
          <AssessmentIcon sx={{ fontSize: 28, color: 'primary.main', mb: 0.5, mx: 'auto' }} />
          <Typography variant="caption" color="text.secondary" gutterBottom noWrap>
            <T>dynamicDashboard.totalExpenses</T>
          </Typography>
          <Typography variant="h6" component="div" fontWeight="bold" noWrap>
            {formatValue(totalExpenses)}
          </Typography>
              <Typography variant="caption" color="text.disabled" noWrap>
              ({totalExpenseEntries} <T>dynamicDashboard.Entries</T>)
              </Typography>
        </Paper>
      </Grid>

      {/* Total Income */}
      <Grid item xs={6} md={6}> {/* Adjusted grid size */}
         <Paper variant="outlined" sx={{ textAlign: 'center', p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'action.hover' }}>
          <TrendingUpIcon sx={{ fontSize: 28, color: 'success.main', mb: 0.5, mx: 'auto' }} />
          <Typography variant="caption" color="text.secondary" gutterBottom noWrap>
            <T>dynamicDashboard.totalIncome</T> {/* Add translation key */}
          </Typography>
          <Typography variant="h6" component="div" fontWeight="bold" noWrap>
            {formatValue(totalIncome)}
          </Typography>
              <Typography variant="caption" color="text.disabled" noWrap>
              ({totalIncomeEntries} <T>dynamicDashboard.Entries</T>)
              </Typography>
        </Paper>
      </Grid>

      {/* Net Flow */}
      <Grid item xs={12} md={12}> {/* Make Net Flow wider */}
         <Paper variant="outlined" sx={{ textAlign: 'center', p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'action.hover' }}>
          <CompareArrowsIcon sx={{ fontSize: 28, color: 'secondary.main', mb: 0.5, mx: 'auto' }} />
          <Typography variant="caption" color="text.secondary" gutterBottom noWrap>
            <T>dynamicDashboard.netFlow</T> {/* Add translation key */}
          </Typography>
          <Typography variant="h6" component="div" fontWeight="bold" sx={{ color: getNetFlowColor() }} noWrap>
             {netFlow >= 0 ? formatValue(netFlow) : `-${formatValue(Math.abs(netFlow))}`}
          </Typography>
        </Paper>
      </Grid>

      {/* Total Entries (Maybe remove if space is tight or combine expense/income counts above) */}
      {/*
      <Grid item xs={6} md={3}>
        <Paper variant="outlined" sx={{ textAlign: 'center', p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: 'action.hover' }}>
          <ReceiptLongIcon sx={{ fontSize: 28, color: 'info.main', mb: 0.5, mx: 'auto' }} />
          <Typography variant="caption" color="text.secondary" gutterBottom noWrap>
            <T>Entries</T> <T>(Exp/Inc)</T>
          </Typography>
          <Typography variant="h6" component="div" fontWeight="bold" noWrap>
            {totalExpenseEntries} / {totalIncomeEntries}
          </Typography>
        </Paper>
      </Grid>
      */}

    </Grid>
  );
}

export default React.memo(OverviewSummaryWidget);
