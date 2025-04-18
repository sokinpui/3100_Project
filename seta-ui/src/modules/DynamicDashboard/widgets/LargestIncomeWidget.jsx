// src/modules/DynamicDashboard/widgets/LargestIncomeWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { format, parseISO, isValid } from 'date-fns';
import { useTranslation } from 'react-i18next';
import T from '../../../utils/T';
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; // Icon for income list items

const MAX_ITEMS = 5; // Max items to show

export default function LargestIncomeWidget({ income = [], isLoading }) {
  const { t } = useTranslation();

  const largestIncomes = useMemo(() => {
    if (!income || income.length === 0) return [];
    return [...income] // Create shallow copy
      .sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0)) // Sort descending by amount
      .slice(0, MAX_ITEMS);
  }, [income]);

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM d') : dateString;
    } catch { return dateString; }
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

  if (largestIncomes.length === 0) {
    // Add translation key
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p: 1 }}><Typography color="text.secondary"><T>dynamicDashboard.noLargestIncomes</T></Typography></Box>;
  }

  return (
    <List disablePadding dense sx={{ height: '100%', overflowY: 'auto' }}>
      {largestIncomes.map((inc, index) => (
        <React.Fragment key={inc.id}>
          <ListItem sx={{ py: 1.5, alignItems: 'flex-start' }}>
             <Box sx={{ mr: 1.5, mt: 0.5, color: 'success.main' }}>
                 <TrendingUpIcon fontSize="small" />
             </Box>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1, mr: 1 }} noWrap title={inc.source}>
                    {inc.source || t('dynamicDashboard.unknownSource')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', flexShrink: 0 }}>
                    +${parseFloat(inc.amount).toFixed(2)}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ mr: 1 }} title={inc.description}>
                    {inc.description || <T>dynamicDashboard.noDescription</T>}
                  </Typography>
                  <Chip label={formatDate(inc.date)} size="small" variant="outlined" sx={{ height: 'auto', fontSize: '0.7rem', flexShrink: 0 }}/>
                </Box>
              }
            />
          </ListItem>
          {index < largestIncomes.length - 1 && <Divider component="li" variant="inset" sx={{ ml: 6 }}/>}
        </React.Fragment>
      ))}
    </List>
  );
}
