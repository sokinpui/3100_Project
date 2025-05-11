// src/modules/DynamicDashboard/widgets/MonthlyComparisonWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { parseISO, isValid } from 'date-fns'; // Removed format import here, moved to hook
import T from '../../../utils/T';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat'; // Import the hook
import { useTheme } from '@mui/material/styles'; // Import useTheme
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Updated Tooltip to use t() and consistent key
const CustomTooltip = ({ active, payload, label }) => {
    const { t } = useTranslation();
    if (active && payload && payload.length) {
        return (
        <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
            <Typography variant="caption">{`${label}`}</Typography>
            <Typography variant="body2" sx={{ color: payload[0].fill }}> {/* Use dynamic fill color */}
                 {/* Use consistent key */}
                {t('dynamicDashboard.totalExpenses')} : ${payload[0].value.toFixed(2)}
            </Typography>
        </Box>
        );
    }
    return null;
};


export function MonthlyComparisonWidget({ expenses, isLoading }) {
    const { format: formatLocaleDate } = useLocalizedDateFormat(); // Use the hook
    const theme = useTheme(); // Get the theme object
    const { t } = useTranslation(); // Get translation function

    const monthlyData = useMemo(() => {
        if (!expenses || expenses.length === 0) return [];
        const monthlyMap = expenses.reduce((acc, expense) => {
          try {
            const date = parseISO(expense.date);
            if (isValid(date)) { // Check if date is valid
                const monthYear = formatLocaleDate(date, 'yyyy-MM'); // Group by YYYY-MM
                const amount = parseFloat(expense.amount) || 0;
                acc[monthYear] = (acc[monthYear] || 0) + amount;
            }
          } catch (e) { console.error("Error parsing date for comparison:", expense.date, e); }
          return acc;
        }, {});
        return Object.entries(monthlyMap)
          .map(([monthYear, total]) => ({
              // Use localized format for display name ('MMM yy')
              name: formatLocaleDate(parseISO(`${monthYear}-01`), 'MMM yyyy'),
              total: total,
              monthYear: monthYear // Keep for sorting
           }))
          .sort((a, b) => a.monthYear.localeCompare(b.monthYear)); // Sort chronologically
      }, [expenses, formatLocaleDate]); // Add formatLocaleDate dependency


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
        {/* Pass the fill color to the tooltip via payload */}
        <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.palette.action.hover }}/>
        {/* <Legend /> */}
        <Bar
            dataKey="total"
            fill={theme.palette.error.main} // Use theme's error color (red)
            name={t('dynamicDashboard.totalExpenses')} // Use translated name
            barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default React.memo(MonthlyComparisonWidget);
