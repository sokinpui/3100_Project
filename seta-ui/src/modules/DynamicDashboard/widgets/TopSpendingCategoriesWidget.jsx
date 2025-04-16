// src/modules/DynamicDashboard/widgets/TopSpendingCategoriesWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getCategoryDetails } from '../../../constants';
import T from '../../../utils/T';

const MAX_CATEGORIES = 5; // Max categories to show

export default function TopSpendingCategoriesWidget({ expenses, isLoading }) {
  const { t } = useTranslation();

  const topCategories = useMemo(() => {
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
      .sort((a, b) => b.value - a.value) // Sort descending by value
      .slice(0, MAX_CATEGORIES);
  }, [expenses, t]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

  if (topCategories.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p: 1 }}><Typography color="text.secondary"><T>dynamicDashboard.noTopCategories</T></Typography></Box>;
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ height: '100%' }}>
      <Table stickyHeader size="small" aria-label={t('dynamicDashboard.topSpendingCategories')}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}><T>dynamicDashboard.category</T></TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}><T>dynamicDashboard.amount</T></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topCategories.map((category) => (
            <TableRow key={category.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {category.name}
              </TableCell>
              <TableCell align="right">${category.value.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
