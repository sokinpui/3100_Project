// src/modules/DynamicDashboard/widgets/IncomeComparisonWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="caption">{`${label}`}</Typography>
        {/* Add specific translation key */}
        <Typography variant="body2" sx={{ color: payload[0].fill }}>{T('dynamicDashboard.totalIncome')} : ${payload[0].value.toFixed(2)}</Typography>
      </Box>
    );
  }
  return null;
};


export default function IncomeComparisonWidget({ income = [], isLoading }) {
    const { t } = useTranslation(); // Get t function

    const monthlyData = useMemo(() => {
        if (!income || income.length === 0) return [];
        const monthlyMap = income.reduce((acc, inc) => {
          try {
            const date = parseISO(inc.date);
            if (isValid(date)) {
                const monthYear = format(date, 'yyyy-MM');
                const amount = parseFloat(inc.amount) || 0;
                acc[monthYear] = (acc[monthYear] || 0) + amount;
            }
          } catch (e) { console.error("Error parsing date for income comparison:", inc.date, e); }
          return acc;
        }, {});
        return Object.entries(monthlyMap)
          .map(([monthYear, total]) => ({
              name: format(parseISO(`${monthYear}-01`), 'MMM yy'), // Format month name
              total: total,
              monthYear: monthYear
           }))
          .sort((a, b) => a.monthYear.localeCompare(b.monthYear)) // Sort chronologically
      }, [income]);


  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

   // Add specific translation key
   if (monthlyData.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p:1 }}><Typography color="text.secondary"><T>dynamicDashboard.noMonthlyIncomeData</T></Typography></Box>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="name" style={{ fontSize: '10px' }} tickMargin={5}/>
        <YAxis style={{ fontSize: '10px' }} tickFormatter={(value) => `$${value.toFixed(0)}`} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        {/* <Legend /> */}
        {/* Add specific translation key for legend/tooltip name */}
        <Bar dataKey="total" fill="#4CAF50" name={t('dynamicDashboard.totalIncome')} barSize={30}/>
      </BarChart>
    </ResponsiveContainer>
  );
}
