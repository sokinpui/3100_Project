import React, { useState } from 'react';
import { Box } from '@mui/material';
import GoalForm from './GoalForm';
import GoalList from './GoalList';

// This component receives data and handlers from PlanningManager
export default function GoalView({ goals, accounts, onAddGoal, onDeleteGoal }) {
    const [isAdding, setIsAdding] = useState(false);

    const handleFormSubmit = async (formData) => {
        setIsAdding(true);
        const success = await onAddGoal(formData);
        setIsAdding(false);
        return success;
    };

    return (
        <Box>
            <GoalForm
                accounts={accounts} // Pass accounts if needed
                onSubmit={handleFormSubmit}
                isSubmitting={isAdding}
            />
            <GoalList
                goals={goals}
                onDelete={onDeleteGoal}
                isDeleting={isAdding}
            />
        </Box>
    );
}
