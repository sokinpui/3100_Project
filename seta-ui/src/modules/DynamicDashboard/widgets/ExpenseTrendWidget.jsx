import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format as formatDateFns, parseISO } from 'date-fns';
import T from '../../../utils/T';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="caption">{`${label}`}</Typography>
        <Typography variant="body2">{`Total : $${payload[0].value.toFixed(2)}`}</Typography>
      </Box>
    );
  }
  return null;
};

export default function ExpenseTrendWidget({ expenses, isLoading }) {

  const monthlyData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const monthlyMap = expenses.reduce((acc, expense) => {
      try {
        const monthYear = formatDateFns(parseISO(expense.date), 'yyyy-MM'); // Group by YYYY-MM
        const amount = parseFloat(expense.amount) || 0;
        acc[monthYear] = (acc[monthYear] || 0) + amount;
      } catch (e) {
        console.error("Error parsing date for trend:", expense.date, e);
      }
      return acc;
    }, {});

    return Object.entries(monthlyMap)
      .map(([monthYear, total]) => ({
          // Format month for display (e.g., 'Jan 23')
          name: formatDateFns(parseISO(`${monthYear}-01`), 'MMM yy'), // Use first day for formatting
          total: total,
          // Keep original monthYear for sorting if needed
          monthYear: monthYear
       }))
      .sort((a, b) => a.monthYear.localeCompare(b.monthYear)); // Sort chronologically
  }, [expenses]);


  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

   if (monthlyData.length < 2) { // Need at least 2 points for a trend line
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p:1 }}><Typography color="text.secondary"><T>dynamicDashboard.notEnoughDataForTrend</T></Typography></Box>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" style={{ fontSize: '10px' }} tickMargin={5} />
        <YAxis style={{ fontSize: '10px' }} tickFormatter={(value) => `$${value.toFixed(0)}`} allowDecimals={false}/>
        <Tooltip content={<CustomTooltip />} />
        {/* <Legend /> */}
        <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 6 }} dot={{r:3}} name="Total Expenses"/>
      </LineChart>
    </ResponsiveContainer>
  );
}
