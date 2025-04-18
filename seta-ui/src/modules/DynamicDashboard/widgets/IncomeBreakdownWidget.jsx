// src/modules/DynamicDashboard/widgets/IncomeBreakdownWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';

// Define colors (can be different from expense colors if desired)
const INCOME_COLORS = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#00BCD4', '#03A9F4'];

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

export default function IncomeBreakdownWidget({ income = [], isLoading }) {
  const { t } = useTranslation();

  const incomeData = useMemo(() => {
    if (!income || income.length === 0) return [];

    const sourceMap = income.reduce((acc, item) => {
      const amount = parseFloat(item.amount) || 0;
       const sourceName = item.source || t('dynamicDashboard.unknownSource'); // Handle missing source
      acc[sourceName] = (acc[sourceName] || 0) + amount;
      return acc;
    }, {});

    return Object.entries(sourceMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort descending by value
  }, [income, t]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

  if (incomeData.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 1, textAlign: 'center' }}><Typography color="text.secondary"><T>dynamicDashboard.noIncomeData</T></Typography></Box>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={incomeData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="80%"
          fill="#8884d8" // Default fill, overridden by Cell
          dataKey="value"
          nameKey="name"
        >
          {incomeData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} // Style legend
          // formatter={(value, entry, index) => <span title={value}>{value}</span>} // Add tooltip to legend items if needed
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
