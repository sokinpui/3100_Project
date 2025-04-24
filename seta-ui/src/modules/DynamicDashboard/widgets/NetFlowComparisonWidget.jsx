// src/modules/DynamicDashboard/widgets/NetFlowComparisonWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat';

const CustomTooltip = ({ active, payload, label }) => {
    const { t } = useTranslation(); // Need t inside tooltip
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const color = value >= 0 ? '#4CAF50' : '#f44336'; // Consistent colors
        return (
          <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
            <Typography variant="caption">{`${label}`}</Typography>
            {/* Add specific translation key */}
            <Typography variant="body2" sx={{ color: color }}>{t('dynamicDashboard.netFlow')} : ${value.toFixed(2)}</Typography>
          </Box>
        );
    }
    return null;
};


export function NetFlowComparisonWidget({ expenses = [], income = [], isLoading }) {
    const { t } = useTranslation();
    const theme = useTheme(); // For colors
    const { format: formatLocaleDate } = useLocalizedDateFormat()

    const monthlyNetFlowData = useMemo(() => {
        if ((!expenses || expenses.length === 0) && (!income || income.length === 0)) return [];

        const monthlyMap = {}; // Key: 'YYYY-MM', Value: { income: X, expense: Y }

        // Process Income
        income.forEach(inc => {
            try {
                const date = parseISO(inc.date);
                if (isValid(date)) {
                    const monthYear = format(date, 'yyyy-MM');
                    const amount = parseFloat(inc.amount) || 0;
                    if (!monthlyMap[monthYear]) monthlyMap[monthYear] = { income: 0, expense: 0 };
                    monthlyMap[monthYear].income += amount;
                }
            } catch (e) { /* ignore */ }
        });

        // Process Expenses
        expenses.forEach(exp => {
            try {
                const date = parseISO(exp.date);
                if (isValid(date)) {
                    const monthYear = format(date, 'yyyy-MM');
                    const amount = parseFloat(exp.amount) || 0;
                    if (!monthlyMap[monthYear]) monthlyMap[monthYear] = { income: 0, expense: 0 };
                    monthlyMap[monthYear].expense += amount;
                }
            } catch (e) { /* ignore */ }
        });

        // Calculate net flow and format for chart
        return Object.entries(monthlyMap)
            .map(([monthYear, totals]) => ({
                name: formatLocaleDate(parseISO(`${monthYear}-01`), 'MMM yy'), // X-axis label
                netFlow: totals.income - totals.expense,
                monthYear: monthYear // For sorting
            }))
            .sort((a, b) => a.monthYear.localeCompare(b.monthYear)); // Sort chronologically

    }, [expenses, income]);


  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

   // Add specific translation key
   if (monthlyNetFlowData.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p:1 }}><Typography color="text.secondary"><T>dynamicDashboard.noMonthlyNetFlowData</T></Typography></Box>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthlyNetFlowData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="name" style={{ fontSize: '10px' }} tickMargin={5}/>
        <YAxis style={{ fontSize: '10px' }} tickFormatter={(value) => `$${value.toFixed(0)}`} allowDecimals={false} />
        {/* Zero line is helpful for net flow */}
        <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
        <Tooltip content={<CustomTooltip />} />
        {/* <Legend /> */}
        {/* Add specific translation key for legend/tooltip name */}
        <Bar dataKey="netFlow" name={t('dynamicDashboard.netFlow')} barSize={30}>
            {/* Use Cell to color bars based on value */}
            {monthlyNetFlowData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.netFlow >= 0 ? theme.palette.success.light : theme.palette.error.light} />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default React.memo(NetFlowComparisonWidget);
