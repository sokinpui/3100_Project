// src/modules/DynamicDashboard/widgets/TopIncomeSourcesWidget.jsx
import React, { useMemo } from 'react';
import {
    Box, Typography, CircularProgress, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';

const MAX_SOURCES = 5; // Max items to show

export default function TopIncomeSourcesWidget({ income = [], isLoading }) {
  const { t } = useTranslation();

  const topSources = useMemo(() => {
    if (!income || income.length === 0) return [];

    const sourceMap = income.reduce((acc, item) => {
      const amount = parseFloat(item.amount) || 0;
      const sourceName = item.source || t('dynamicDashboard.unknownSource'); // Handle missing source
      acc[sourceName] = (acc[sourceName] || 0) + amount;
      return acc;
    }, {});

    return Object.entries(sourceMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value) // Sort descending by value
      .slice(0, MAX_SOURCES);
  }, [income, t]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

  if (topSources.length === 0) {
    // Add a specific translation key for this
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p: 1 }}><Typography color="text.secondary"><T>dynamicDashboard.noIncomeData</T></Typography></Box>;
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ height: '100%' }}>
      {/* Add specific translation key */}
      <Table stickyHeader size="small" aria-label={t('dynamicDashboard.topIncomeSources')}>
        <TableHead>
          <TableRow>
            {/* Add specific translation key */}
            <TableCell sx={{ fontWeight: 'bold' }}><T>dynamicDashboard.source</T></TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}><T>dynamicDashboard.amount</T></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topSources.map((source) => (
            <TableRow key={source.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={source.name}>
                {source.name}
              </TableCell>
              <TableCell align="right">${source.value.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
