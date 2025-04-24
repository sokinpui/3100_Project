// src/modules/DynamicDashboard/widgets/LargestExpensesWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { format as formatDateFns } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getCategoryDetails } from '../../../constants';
import T from '../../../utils/T';
import { useLocalizedDateFormat } from '../../../utils/useLocalizedDateFormat';

const MAX_ITEMS = 5; // Max items to show

export function LargestExpensesWidget({ expenses, isLoading }) {
  const { t } = useTranslation();
  const { format: formatLocaleDate } = useLocalizedDateFormat();

  const largestExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];
    return [...expenses] // Create shallow copy
      .sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0)) // Sort descending by amount
      .slice(0, MAX_ITEMS);
  }, [expenses]);

  const formatDate = (dateString) => {
    try { return formatLocaleDate(new Date(dateString), 'MMM d'); } catch { return dateString; }
  }

  const getTranslatedCategory = (name) => {
      const details = getCategoryDetails(name);
      const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
      return t(key, { defaultValue: name });
  }

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }

  if (largestExpenses.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p: 1 }}><Typography color="text.secondary"><T>dynamicDashboard.noLargestExpenses</T></Typography></Box>;
  }

  return (
    <List disablePadding dense sx={{ height: '100%', overflowY: 'auto' }}>
      {largestExpenses.map((exp, index) => (
        <React.Fragment key={exp.id}>
          <ListItem sx={{ py: 1 }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1, mr: 1 }} noWrap>
                    {exp.description || getTranslatedCategory(exp.category_name)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary', flexShrink: 0 }}>
                    ${parseFloat(exp.amount).toFixed(2)}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ mr: 1 }}>
                    {exp.description ? getTranslatedCategory(exp.category_name) : ''} {/* Show category if description exists */}
                  </Typography>
                  <Chip label={formatDate(exp.date)} size="small" variant="outlined" sx={{ height: 'auto', fontSize: '0.7rem' }}/>
                </Box>
              }
            />
          </ListItem>
          {index < largestExpenses.length - 1 && <Divider component="li" variant="inset" />}
        </React.Fragment>
      ))}
    </List>
  );
}

export default React.memo(LargestExpensesWidget);
