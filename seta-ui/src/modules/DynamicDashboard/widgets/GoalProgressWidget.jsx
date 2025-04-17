// src/modules/DynamicDashboard/widgets/GoalProgressWidget.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, LinearProgress, Grid, Tooltip } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import axios from 'axios';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:8000';

export default function GoalProgressWidget({ userId }) {
    const { t } = useTranslation();
    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGoals = async () => {
            if (!userId) return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_URL}/goals/${userId}`);
                setGoals(response.data);
            } catch (err) {
                console.error("Error fetching goals:", err);
                setError(t('dynamicDashboard.fetchError'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchGoals();
    }, [userId, t]);

    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30} /></Box>;
    }
    if (error) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 1, textAlign: 'center' }}><Typography color="error" variant="caption">{error}</Typography></Box>;
    }
     if (goals.length === 0) {
        return (
             <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2, textAlign: 'center' }}>
                <FlagIcon color="disabled" sx={{ fontSize: 30, mb: 1 }} />
                <Typography color="text.secondary" variant="body2">
                    <T>dynamicDashboard.noGoalsSet</T> {/* Add new translation key */}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', overflowY: 'auto', p: 1 }}>
            <Grid container spacing={2.5}>
                {goals.map((goal) => {
                    const target = parseFloat(goal.target_amount) || 0;
                    // Using current_amount directly from DB for now
                    const current = parseFloat(goal.current_amount) || 0;
                    const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

                    return (
                        <Grid item xs={12} key={goal.id}>
                             <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight={500} noWrap title={goal.name}>
                                        {goal.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ${current.toFixed(0)} / ${target.toFixed(0)}
                                    </Typography>
                                </Box>
                                <Tooltip title={`${progress.toFixed(0)}%`} placement="top">
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        color="success" // Or make dynamic based on progress/deadline
                                        sx={{ height: 6, borderRadius: 3 }}
                                    />
                                </Tooltip>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
