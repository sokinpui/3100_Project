// src/modules/DynamicDashboard/widgets/TopUnbudgetedCategoryWidget.jsx
import React, { useMemo } from 'react';
import { Box, Typography, CircularProgress, Paper, Button } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // Icon for attention
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { getCategoryDetails } from '../../../constants';
import { useNavigate } from 'react-router-dom'; // To navigate to planning

export default function TopUnbudgetedCategoryWidget({ expenses = [], budgets = [], isLoading }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const topUnbudgeted = useMemo(() => {
        if (isLoading || !expenses || expenses.length === 0) {
            return null;
        }

        // Get set of categories that HAVE a budget rule
        const budgetedCategories = new Set(budgets.map(b => b.category_name));

        // Calculate spending per category for UNBUDGETED categories
        const unbudgetedSpending = expenses.reduce((acc, exp) => {
            const category = exp.category_name || 'Uncategorized';
            // Only consider categories *not* in the budgeted set
            if (!budgetedCategories.has(category) && category !== 'Uncategorized') {
                const amount = parseFloat(exp.amount) || 0;
                acc[category] = (acc[category] || 0) + amount;
            }
            return acc;
        }, {});

        // Find the category with the highest spending among unbudgeted ones
        let topCat = null;
        let maxAmount = 0;
        for (const [category, amount] of Object.entries(unbudgetedSpending)) {
            if (amount > maxAmount) {
                maxAmount = amount;
                topCat = category;
            }
        }

        if (!topCat) {
            return { name: null, amount: 0 }; // Case where all spending is budgeted or no spending
        }

        // Translate the category name for display
        const details = getCategoryDetails(topCat);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        const translatedName = t(key, { defaultValue: topCat });

        return { name: translatedName, rawName: topCat, amount: maxAmount };

    }, [expenses, budgets, isLoading, t]);

    const handleSetBudgetClick = () => {
        // Navigate to the planning manager, potentially passing the category? (Future enhancement)
        navigate('/planning');
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30}/></Box>;
    }

    if (!topUnbudgeted || !topUnbudgeted.name) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', p: 2 }}>
                <Typography color="text.secondary">
                    {/* Add translation key */}
                    <T>dynamicDashboard.allCategoriesBudgeted</T>
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', p: 2 }}>
            <Paper elevation={0} sx={{ bgcolor: 'transparent' }}>
                <WarningAmberIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                 {/* Add translation key */}
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    <T>dynamicDashboard.topUnbudgetedSpending</T>
                </Typography>
                <Typography variant="h6" component="div" fontWeight="bold" noWrap title={topUnbudgeted.name}>
                    {topUnbudgeted.name}
                </Typography>
                <Typography variant="h5" component="div" fontWeight="bold" color="warning.dark">
                    ${topUnbudgeted.amount.toFixed(2)}
                </Typography>
                 <Button size="small" variant="outlined" sx={{mt: 1.5, textTransform: 'none'}} onClick={handleSetBudgetClick}>
                     {/* Add translation key */}
                    <T>dynamicDashboard.goToBudgetSetup</T>
                 </Button>
            </Paper>
        </Box>
    );
}
