// src/modules/DynamicDashboard/widgets/NetFlowTrendWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO, isValid } from 'date-fns';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const color = value >= 0 ? '#4CAF50' : '#f44336'; // Green for positive, red for negative
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="caption">{label}</Typography>
        {/* Add specific translation key */}
        <Typography variant="body2" sx={{ color: color }}>{T('dynamicDashboard.netFlow')} : ${value.toFixed(2)}</Typography>
      </Box>
    );
  }
  return null;
};

export function NetFlowTrendWidget({ expenses = [], income = [], isLoading }) {
  const { t } = useTranslation(); // Get t function

  const dailyNetFlowData = useMemo(() => {
    if ((!expenses || expenses.length === 0) && (!income || income.length === 0)) return [];

    const dailyMap = {}; // Use date string 'YYYY-MM-DD' as key

    // Process Income
    income.forEach(inc => {
      try {
        const date = parseISO(inc.date);
        if (isValid(date)) {
            const dateString = format(date, 'yyyy-MM-dd');
            const amount = parseFloat(inc.amount) || 0;
            if (!dailyMap[dateString]) dailyMap[dateString] = { income: 0, expense: 0 };
            dailyMap[dateString].income += amount;
        }
      } catch (e) { console.error("Error parsing date for net flow (income):", inc.date, e); }
    });

    // Process Expenses
    expenses.forEach(exp => {
      try {
        const date = parseISO(exp.date);
         if (isValid(date)) {
            const dateString = format(date, 'yyyy-MM-dd');
            const amount = parseFloat(exp.amount) || 0;
            if (!dailyMap[dateString]) dailyMap[dateString] = { income: 0, expense: 0 };
            dailyMap[dateString].expense += amount;
        }
      } catch (e) { console.error("Error parsing date for net flow (expense):", exp.date, e); }
    });

    // Calculate net flow and format for chart
    return Object.entries(dailyMap)
      .map(([dateString, totals]) => ({
          date: dateString,
          name: format(parseISO(dateString), 'MMM d'), // X-axis label
          netFlow: totals.income - totals.expense,
       }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically

  }, [expenses, income]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

   // Add specific translation key
   if (dailyNetFlowData.length < 2) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p:1 }}>
            <Typography color="text.secondary"><T>dynamicDashboard.notEnoughDataForNetFlowTrend</T></Typography>
        </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={dailyNetFlowData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
            dataKey="name"
            style={{ fontSize: '10px' }}
            tickMargin={5}
            interval={dailyNetFlowData.length > 30 ? Math.floor(dailyNetFlowData.length / 7) : 'preserveStartEnd'}
            />
        <YAxis
            style={{ fontSize: '10px' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            allowDecimals={false}
            // Allow negative ticks
            allowDataOverflow={true}
            />
        <Tooltip content={<CustomTooltip />} />
        {/* Add a reference line at y=0 to clearly show positive/negative */}
        <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
        {/* <Legend /> */}
        <Line
            type="monotone"
            dataKey="netFlow"
            stroke="#ff7300" // Orange color for net flow
            strokeWidth={2}
            activeDot={{ r: 5 }}
            dot={dailyNetFlowData.length < 60}
            name={t('dynamicDashboard.netFlow')} // Legend name
            isAnimationActive={true}
            animationDuration={300}
            />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default React.memo(NetFlowTrendWidget);
