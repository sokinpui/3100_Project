// src/modules/PlanningManager/components/GoalView.jsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import GoalForm from './GoalForm';
import GoalList from './GoalList';

// This component receives data and handlers from PlanningManager
export default function GoalView({
    goals,
    accounts,
    onAddGoal,
    onDeleteGoal,
    // Receive bulk delete props
    isDeleting,
    selectedGoalIds,
    onSelectionChange,
    onBulkDelete
}) {
    const [isAdding, setIsAdding] = useState(false); // Keep for form submission state

    const handleFormSubmit = async (formData) => {
        setIsAdding(true);
        const success = await onAddGoal(formData);
        setIsAdding(false);
        return success;
    };

    return (
        <Box>
            <GoalForm
                accounts={accounts}
                onSubmit={handleFormSubmit}
                isSubmitting={isAdding} // Use form-specific loading state
            />
            <GoalList
                goals={goals}
                onDelete={onDeleteGoal}
                isDeleting={isDeleting} // Pass the overall deleting state from parent
                // Pass bulk delete props down
                selectedGoalIds={selectedGoalIds}
                onSelectionChange={onSelectionChange}
                handleBulkDelete={onBulkDelete}
            />
        </Box>
    );
}
