// src/modules/DynamicDashboard/widgets/ExpenseTrendWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format as formatDateFns, parseISO, isValid } from 'date-fns'; // Added isValid
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Label should now be a formatted date string (e.g., 'Jan 15')
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="caption">{label}</Typography>
        <Typography variant="body2">{`Total : $${payload[0].value.toFixed(2)}`}</Typography>
      </Box>
    );
  }
  return null;
};

export default function ExpenseTrendWidget({ expenses, isLoading, timePeriod }) { // Added timePeriod prop if needed for axis formatting later
  const { t } = useTranslation(); // Get translation function

  // --- Aggregate data daily ---
  const dailyData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const dailyMap = expenses.reduce((acc, expense) => {
      try {
        const expenseDate = parseISO(expense.date);
        if (isValid(expenseDate)) {
            const dateString = formatDateFns(expenseDate, 'yyyy-MM-dd'); // Group by YYYY-MM-DD
            const amount = parseFloat(expense.amount) || 0;
            acc[dateString] = (acc[dateString] || 0) + amount;
        }
      } catch (e) {
        console.error("Error parsing date for daily trend:", expense.date, e);
      }
      return acc;
    }, {});

    // Convert map to array and sort chronologically
    return Object.entries(dailyMap)
      .map(([dateString, total]) => ({
          // Keep full date for potential tooltip use or internal logic
          date: dateString,
          // Format date for X-axis label (e.g., 'Jan 15')
          // Consider adjusting format based on timePeriod range (e.g., show year if range > 1 year)
          name: formatDateFns(parseISO(dateString), 'MMM d'),
          total: total,
       }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Sort by YYYY-MM-DD string

  }, [expenses]); // Removed timePeriod dependency unless used for formatting

  // --- Update title key (optional but recommended) ---
  // You might want a new translation key like 'dynamicDashboard.dailyExpenseTrend'
  // For now, we'll keep the existing title but the chart shows daily data.
  const widgetTitleKey = 'dynamicDashboard.expenseTrend'; // Or change to a new key

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

   // Need at least 2 data points for a meaningful line chart
   if (dailyData.length < 2) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p:1 }}>
            {/* Use the original "not enough data" translation, it still applies */}
            <Typography color="text.secondary"><T>dynamicDashboard.notEnoughDataForTrend</T></Typography>
        </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* Adjust margins if needed for potentially more x-axis labels */}
      <LineChart data={dailyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        {/* XAxis now uses the daily formatted 'name' (e.g., 'Jan 15') */}
        {/* Consider adding interval="preserveStartEnd" or calculating interval based on data length */}
        <XAxis
            dataKey="name"
            style={{ fontSize: '10px' }}
            tickMargin={5}
            // interval="preserveStartEnd" // Shows first/last labels, might skip intermediate ones
            // interval={Math.floor(dailyData.length / 10)} // Example: Show ~10 labels max
            interval={dailyData.length > 30 ? Math.floor(dailyData.length / 7) : 'preserveStartEnd'} // Adaptive interval
            />
        <YAxis
            style={{ fontSize: '10px' }}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
            allowDecimals={false}
            />
        <Tooltip content={<CustomTooltip />} />
        {/* Legend might be less useful for a single line, can be removed */}
        {/* <Legend /> */}
        <Line
            type="monotone"
            dataKey="total"
            stroke="#8884d8"
            strokeWidth={2}
            activeDot={{ r: 5 }} // Slightly smaller active dot
            dot={dailyData.length < 60} // Only show dots if data points are not too dense
            name={t('dynamicDashboard.totalExpenses')} // Translate legend name if shown
            isAnimationActive={true} // Keep animation
            animationDuration={300}
            />
      </LineChart>
    </ResponsiveContainer>
  );
}
