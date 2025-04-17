import React, { useState } from 'react';
import { Box } from '@mui/material';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';

// This component receives data and handlers from PlanningManager
export default function BudgetView({ budgets, accounts, onAddBudget, onDeleteBudget }) {
    const [isAdding, setIsAdding] = useState(false); // State for form submission loading

    const handleFormSubmit = async (formData) => {
        setIsAdding(true);
        const success = await onAddBudget(formData); // Call handler from parent
        setIsAdding(false);
        return success; // Return success status to form for potential reset
    };

    return (
        <Box>
            <BudgetForm
                accounts={accounts} // Pass accounts if needed
                onSubmit={handleFormSubmit}
                isSubmitting={isAdding}
            />
            <BudgetList
                budgets={budgets}
                onDelete={onDeleteBudget} // Pass delete handler
                isDeleting={isAdding} // Can reuse isAdding or add specific isDeleting prop if needed
            />
        </Box>
    );
}
