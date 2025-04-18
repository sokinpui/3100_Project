// src/modules/DynamicDashboard/widgets/CategorySpendingTimelineWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format as formatDateFns, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getCategoryDetails } from '../../../constants';
import T from '../../../utils/T';

// Re-use or define colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57', '#ffc658'];

const CustomTooltip = ({ active, payload, label, categoryNames }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="caption" display="block" gutterBottom>{label}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {`${entry.name} : $${entry.value.toFixed(2)}`}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export function CategorySpendingTimelineWidget({ expenses, isLoading }) {
  const { t } = useTranslation();

  const { timelineData, categoryNames } = useMemo(() => {
    if (!expenses || expenses.length === 0) return { timelineData: [], categoryNames: [] };

    const monthlyCategoryMap = expenses.reduce((acc, expense) => {
      try {
        const monthYear = formatDateFns(parseISO(expense.date), 'yyyy-MM');
        const amount = parseFloat(expense.amount) || 0;
        const categoryName = expense.category_name || 'Uncategorized';

        if (!acc[monthYear]) {
          acc[monthYear] = {};
        }
        acc[monthYear][categoryName] = (acc[monthYear][categoryName] || 0) + amount;
      } catch (e) {
        console.error("Error processing expense for timeline:", expense, e);
      }
      return acc;
    }, {});

    const allCategories = new Set();
    Object.values(monthlyCategoryMap).forEach(monthData => {
      Object.keys(monthData).forEach(cat => allCategories.add(cat));
    });

    const translatedCategoryNames = {};
    allCategories.forEach(name => {
        const details = getCategoryDetails(name);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        translatedCategoryNames[name] = t(key, { defaultValue: name });
    });

    const data = Object.entries(monthlyCategoryMap)
      .map(([monthYear, categories]) => {
        const monthEntry = {
          name: formatDateFns(parseISO(`${monthYear}-01`), 'MMM yy'),
          monthYear: monthYear,
        };
        allCategories.forEach(catName => {
            const translatedName = translatedCategoryNames[catName];
            monthEntry[translatedName] = categories[catName] || 0; // Use translated name as key for the chart
        });
        return monthEntry;
      })
      .sort((a, b) => a.monthYear.localeCompare(b.monthYear));

    return { timelineData: data, categoryNames: Object.values(translatedCategoryNames) };
  }, [expenses, t]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

  if (timelineData.length < 2) { // Need at least 2 points for a chart
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p: 1 }}><Typography color="text.secondary"><T>dynamicDashboard.noTimelineData</T></Typography></Box>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={timelineData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}> {/* Increased bottom margin for legend */}
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" style={{ fontSize: '10px' }} tickMargin={5} />
        <YAxis style={{ fontSize: '10px' }} tickFormatter={(value) => `$${value.toFixed(0)}`} allowDecimals={false} />
        <Tooltip content={<CustomTooltip categoryNames={categoryNames} />} />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
        {categoryNames.map((catName, index) => (
          <Area
            key={catName}
            type="monotone"
            dataKey={catName} // Use translated name
            stackId="1"
            stroke={COLORS[index % COLORS.length]}
            fill={COLORS[index % COLORS.length]}
            fillOpacity={0.6}
            name={catName} // Legend name
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default React.memo(CategorySpendingTimelineWidget);
