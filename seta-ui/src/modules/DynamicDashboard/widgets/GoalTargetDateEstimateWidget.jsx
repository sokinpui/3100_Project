// src/modules/DynamicDashboard/widgets/GoalTargetDateEstimateWidget.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Typography, CircularProgress, Paper, FormControl,
    InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO, isValid, differenceInMonths, addMonths, isAfter } from 'date-fns';

// Helper function
function formatCurrency(value) {
    const num = parseFloat(value);
    return isNaN(num) ? '-' : `$${num.toFixed(2)}`;
}

export default function GoalTargetDateEstimateWidget({ goals = [], income = [], expenses = [], isLoading, timePeriod }) {
    const { t } = useTranslation();
    const [selectedGoalId, setSelectedGoalId] = useState('');

    // Set default goal selection when goals load
    useEffect(() => {
        if (!selectedGoalId && goals.length > 0) {
            // Select the first non-completed goal by default, or just the first one
            const firstOngoing = goals.find(g => parseFloat(g.current_amount) < parseFloat(g.target_amount));
            setSelectedGoalId(firstOngoing ? firstOngoing.id : goals[0].id);
        }
    }, [goals, selectedGoalId]);

    const selectedGoal = useMemo(() => {
        return goals.find(g => g.id === selectedGoalId);
    }, [selectedGoalId, goals]);

    const estimate = useMemo(() => {
        if (!selectedGoal || isLoading) return { estimateDate: null, avgMonthlyNet: 0, warning: null };

        const targetAmount = parseFloat(selectedGoal.target_amount) || 0;
        const currentAmount = parseFloat(selectedGoal.current_amount) || 0;
        const remainingAmount = targetAmount - currentAmount;

        if (remainingAmount <= 0) {
            return { estimateDate: null, avgMonthlyNet: 0, warning: t('dynamicDashboard.goalAlreadyMet') };
        }
        if (targetAmount <= 0) {
             return { estimateDate: null, avgMonthlyNet: 0, warning: t('dynamicDashboard.goalInvalidTarget') };
        }

        // Calculate Net Flow for the *current time period* provided by props
        // NOTE: This is a limitation. A true estimate needs historical average.
        const periodIncome = income.reduce((sum, inc) => sum + (parseFloat(inc.amount) || 0), 0);
        const periodExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        const periodNetFlow = periodIncome - periodExpenses;

        let avgMonthlyNet = 0;
        let monthsInPeriod = 1; // Default to 1 month if range is small or invalid

        if (timePeriod?.startDate && timePeriod?.endDate && isValid(timePeriod.startDate) && isValid(timePeriod.endDate)) {
            // Calculate months difference, ensure at least 1
             monthsInPeriod = Math.max(1, differenceInMonths(timePeriod.endDate, timePeriod.startDate) + 1);
             avgMonthlyNet = periodNetFlow / monthsInPeriod;
        } else {
             // If no valid period, cannot calculate average
             avgMonthlyNet = 0; // Or maybe use total net flow? Decided against it.
        }


        if (avgMonthlyNet <= 0) {
            return { estimateDate: null, avgMonthlyNet: avgMonthlyNet, warning: t('dynamicDashboard.goalNegativeSavings') };
        }

        const monthsNeeded = Math.ceil(remainingAmount / avgMonthlyNet);
        const estimateDate = addMonths(new Date(), monthsNeeded); // Estimate from today

        // Compare with target date if it exists
        const targetDate = selectedGoal.target_date ? parseISO(selectedGoal.target_date) : null;
        let warning = null;
        if(targetDate && isValid(targetDate) && isAfter(estimateDate, targetDate)) {
            warning = t('dynamicDashboard.goalEstimateAfterTarget', { targetDate: format(targetDate, 'MMM yyyy') });
        }

        return { estimateDate, avgMonthlyNet, warning };

    }, [selectedGoal, income, expenses, isLoading, timePeriod, t]);


    const handleGoalChange = (event) => {
        setSelectedGoalId(event.target.value);
    };

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30}/></Box>;
    }

    if (goals.length === 0) {
         return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, textAlign: 'center' }}><Typography color="text.secondary"><T>dynamicDashboard.noGoalsSet</T></Typography></Box>;
    }

    return (
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                 {/* Add translation key */}
                <InputLabel id="goal-select-label"><T>dynamicDashboard.selectGoal</T></InputLabel>
                <Select
                    labelId="goal-select-label"
                    value={selectedGoalId}
                    label={t('dynamicDashboard.selectGoal')}
                    onChange={handleGoalChange}
                >
                    {goals.map((goal) => (
                        <MenuItem key={goal.id} value={goal.id}>
                            {goal.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedGoal && (
                <Paper variant='outlined' sx={{ p: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                    <FlagIcon sx={{ fontSize: 30, color: 'success.main', mb: 1, mx: 'auto' }} />
                    <Typography variant="body2" color="text.secondary" noWrap title={selectedGoal.name}>
                        {selectedGoal.name}
                    </Typography>
                    <Typography variant="caption" sx={{ mb: 1 }}>
                        {formatCurrency(selectedGoal.current_amount)} / {formatCurrency(selectedGoal.target_amount)}
                    </Typography>

                    {estimate.estimateDate ? (
                        <>
                            <Typography variant="h6" component="div" fontWeight="bold">
                                {format(estimate.estimateDate, 'MMM yyyy')}
                            </Typography>
                             {/* Add translation key */}
                            <Typography variant="caption" color="text.secondary">
                                <T>dynamicDashboard.estimatedCompletion</T>
                            </Typography>
                        </>
                    ) : (
                        <Typography variant="h6" component="div" fontWeight="bold" color="text.disabled">
                             {/* Add translation key */}
                            <T>dynamicDashboard.estimationUnavailable</T>
                        </Typography>
                    )}
                     {estimate.warning && (
                        <Alert severity="warning" icon={false} sx={{ fontSize: '0.7rem', p: 0.5, mt: 1, textAlign: 'center' }}>
                            {estimate.warning}
                        </Alert>
                     )}
                      {/* Add translation key */}
                     <Typography variant="caption" color="text.disabled" sx={{mt: 1, display: 'block'}}>
                        <T>dynamicDashboard.basedOnAvgSaving</T> {formatCurrency(estimate.avgMonthlyNet)}/mo*
                     </Typography>
                </Paper>
            )}
             {/* Add translation key */}
             <Typography variant="caption" color="text.disabled" sx={{mt: 1, textAlign: 'center', fontStyle: 'italic'}}>
                 * <T>dynamicDashboard.estimateDisclaimer</T>
             </Typography>
        </Box>
    );
}
