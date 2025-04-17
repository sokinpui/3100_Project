// src/modules/PlanningManager/components/BudgetView.jsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';

// This component receives data and handlers from PlanningManager
export default function BudgetView({
    budgets,
    accounts,
    onAddBudget,
    onDeleteBudget,
    // Receive bulk delete props
    isDeleting,
    selectedBudgetIds,
    onSelectionChange,
    onBulkDelete
}) {
    const [isAdding, setIsAdding] = useState(false); // Keep for form submission state

    const handleFormSubmit = async (formData) => {
        setIsAdding(true);
        const success = await onAddBudget(formData);
        setIsAdding(false);
        return success;
    };

    return (
        <Box>
            <BudgetForm
                accounts={accounts}
                onSubmit={handleFormSubmit}
                isSubmitting={isAdding} // Use form-specific loading state
            />
            <BudgetList
                budgets={budgets}
                onDelete={onDeleteBudget}
                isDeleting={isDeleting} // Pass the overall deleting state from parent
                // Pass bulk delete props down
                selectedBudgetIds={selectedBudgetIds}
                onSelectionChange={onSelectionChange}
                handleBulkDelete={onBulkDelete}
            />
        </Box>
    );
}
