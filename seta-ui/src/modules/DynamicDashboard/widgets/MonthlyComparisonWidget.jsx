import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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


export default function MonthlyComparisonWidget({ expenses, isLoading }) {

    // Re-use the same data aggregation logic as ExpenseTrendWidget
    const monthlyData = useMemo(() => {
        if (!expenses || expenses.length === 0) return [];
        const monthlyMap = expenses.reduce((acc, expense) => {
          try {
            const monthYear = formatDateFns(parseISO(expense.date), 'yyyy-MM');
            const amount = parseFloat(expense.amount) || 0;
            acc[monthYear] = (acc[monthYear] || 0) + amount;
          } catch (e) { console.error("Error parsing date for comparison:", expense.date, e); }
          return acc;
        }, {});
        return Object.entries(monthlyMap)
          .map(([monthYear, total]) => ({
              name: formatDateFns(parseISO(`${monthYear}-01`), 'MMM yy'),
              total: total,
              monthYear: monthYear
           }))
          .sort((a, b) => a.monthYear.localeCompare(b.monthYear))
          .slice(-6); // Show last 6 months for comparison (adjust as needed)
      }, [expenses]);


  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

   if (monthlyData.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p:1 }}><Typography color="text.secondary"><T>dynamicDashboard.noMonthlyData</T></Typography></Box>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="name" style={{ fontSize: '10px' }} tickMargin={5}/>
        <YAxis style={{ fontSize: '10px' }} tickFormatter={(value) => `$${value.toFixed(0)}`} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        {/* <Legend /> */}
        <Bar dataKey="total" fill="#82ca9d" name="Total Expenses" barSize={30}/>
      </BarChart>
    </ResponsiveContainer>
  );
}
