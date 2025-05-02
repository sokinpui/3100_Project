// src/modules/common/DataSummaryCards.jsx
import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import {
    Assessment as AssessmentIcon, // For Expenses
    ListAlt as ListAltIcon, // For Entries
    TrendingUp as TrendingUpIcon, // For Income
    ReceiptLong as ReceiptLongIcon // Alternative for Income Entries? Let's use ListAltIcon for consistency
} from '@mui/icons-material';
import T from '../../utils/T';

// Helper function to format currency
const formatCurrency = (value) => `$${Number(value).toFixed(2)}`;

export default function DataSummaryCards({ data = [], type = 'expense', isLoading }) {
    // Prevent errors if data is not yet loaded or invalid
    const safeData = Array.isArray(data) ? data : [];

    const calculateTotalAmount = () => {
        return safeData
            .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
            .toFixed(2);
    };

    const totalEntries = safeData.length;
    const totalAmount = calculateTotalAmount();

    // Determine props based on type
    const isExpense = type === 'expense';
    const titleKey1 = isExpense ? 'expenseManager.totalExpenses' : 'dynamicDashboard.totalIncome';
    const titleKey2 = isExpense ? 'expenseManager.totalEntries' : 'dynamicDashboard.incomeEntries'; // Need this key for income
    const Icon1 = isExpense ? AssessmentIcon : TrendingUpIcon;
    const Icon2 = ListAltIcon; // Consistent icon for entries
    const color1 = isExpense ? 'primary.main' : 'success.main';
    const color2 = 'info.main'; // Consistent color for entries card

    return (
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Total Amount Card */}
            <Card sx={{ flexGrow: 1, minWidth: 240 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Icon1 fontSize="large" sx={{ mr: 2, color: color1 }} />
                    <Box>
                        <Typography variant="body2" color="text.secondary"><T>{titleKey1}</T></Typography>
                        <Typography variant="h5" component="div" fontWeight="bold">{formatCurrency(totalAmount)}</Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Total Entries Card */}
            <Card sx={{ flexGrow: 1, minWidth: 240 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                    <Icon2 fontSize="large" sx={{ mr: 2, color: color2 }} />
                    <Box>
                        <Typography variant="body2" color="text.secondary"><T>{titleKey2}</T></Typography>
                        <Typography variant="h5" component="div" fontWeight="bold">{totalEntries}</Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
