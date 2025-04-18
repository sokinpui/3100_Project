import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { getCategoryDetails } from '../../../constants'; // Your category constants

// Helper function to generate colors (simple version)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1, border: '1px solid #ccc', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="body2">{`${payload[0].name} : $${payload[0].value.toFixed(2)}`}</Typography>
      </Box>
    );
  }
  return null;
};

export function CategoryBreakdownWidget({ expenses, isLoading }) {
  const { t } = useTranslation();

  const categoryData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const categoryMap = expenses.reduce((acc, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      const categoryName = expense.category_name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + amount;
      return acc;
    }, {});

    return Object.entries(categoryMap)
      .map(([name, value]) => {
        const details = getCategoryDetails(name);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        const translatedName = t(key, { defaultValue: name });
        return { name: translatedName, value };
      })
      .sort((a, b) => b.value - a.value); // Sort descending by value
  }, [expenses, t]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

  if (categoryData.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Typography color="text.secondary">No category data available.</Typography></Box>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="80%" // Adjust size as needed
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} // Optional labels
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: '12px' }} // Adjust legend style
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default React.memo(CategoryBreakdownWidget);
