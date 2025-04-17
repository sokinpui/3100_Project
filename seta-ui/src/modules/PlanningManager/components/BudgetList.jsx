// src/modules/PlanningManager/components/BudgetList.jsx
import React from 'react';
import {
    Card, CardHeader, CardContent, Box, Typography, Tooltip, IconButton, Button, CircularProgress
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { enUS, zhCN } from '@mui/x-data-grid/locales'; // Import locales
import { Delete as DeleteIcon } from '@mui/icons-material';
import T from '../../../utils/T';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { getCategoryDetails } from '../../../constants';

// Map language codes to MUI locale objects
const dataGridLocaleTextMap = {
  english: enUS.components.MuiDataGrid.defaultProps.localeText,
  zh: zhCN.components.MuiDataGrid.defaultProps.localeText,
};

export default function BudgetList({
    budgets,
    onDelete,
    isDeleting, // Combined deleting state
    onSelectionChange,
    handleBulkDelete,
    selectedBudgetIds
}) {
    const { t, i18n } = useTranslation(); // Get i18n instance

    // Determine current locale for DataGrid
    const currentLanguage = i18n.language.split('-')[0]; // Get base language ('en', 'zh')
    const dataGridLocale = dataGridLocaleTextMap[currentLanguage] || dataGridLocaleTextMap['english'];

    const getTranslatedCategory = (name) => {
        const details = getCategoryDetails(name);
        const key = details ? `expenseManager.category_${details.key}` : 'expenseManager.category_unknown';
        return t(key, { defaultValue: name });
     }

    const columns: GridColDef[] = [
        {
            field: 'category_name',
            headerName: t('expenseManager.category'),
            width: 200,
            renderCell: (params) => getTranslatedCategory(params.value),
            valueGetter: (value) => getTranslatedCategory(value),
        },
        {
            field: 'amount_limit',
            headerName: t('budgetManager.amountLimit'),
            width: 150,
            type: 'number',
            valueFormatter: (value) => value != null ? `$${Number(value).toFixed(2)}` : '',
            cellClassName: 'font-tabular-nums',
            headerAlign: 'left', align: 'left'
        },
         {
            field: 'period',
            headerName: t('budgetManager.period'),
            width: 120,
            renderCell: (params) => <T>{`recurringManager.frequency_${params.value}`}</T>,
            valueGetter: (value) => t(`recurringManager.frequency_${value}`),
        },
        {
            field: 'start_date',
            headerName: t('budgetManager.startDate'),
            width: 130,
            type: 'date',
            valueGetter: (value) => value ? parseISO(value) : null,
            renderCell: (params) => params.value ? format(params.value, 'yyyy-MM-dd') : '',
        },
         {
            field: 'end_date',
            headerName: t('budgetManager.endDate'),
            width: 130,
            type: 'date',
            valueGetter: (value) => value ? parseISO(value) : null,
            renderCell: (params) => params.value ? format(params.value, 'yyyy-MM-dd') : <Typography variant="caption" color="text.disabled">None</Typography>,
        },
        {
            field: 'actions',
            headerName: t('common.actions'),
            width: 80,
            sortable: false, filterable: false, align: 'center', headerAlign: 'center',
            renderCell: (params) => (
                <Box>
                    <Tooltip title={t('common.delete')} arrow>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(params.row)}
                            disabled={isDeleting}
                        >
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
         <Card elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <CardHeader
                title={<T>budgetManager.listTitle</T>}
                action={
                    selectedBudgetIds.length > 0 && (
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            startIcon={isDeleting && selectedBudgetIds.length > 0 ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                            sx={{ textTransform: 'none', mr: 1 }}
                        >
                            <T>budgetManager.deleteSelected</T> ({selectedBudgetIds.length})
                        </Button>
                    )
                }
                sx={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee', py: 1.5 }}
            />
            <CardContent sx={{ p: 0 }}>
                 <DataGrid
                    autoHeight
                    rows={budgets}
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                        sorting: { sortModel: [{ field: 'category_name', sort: 'asc' }] },
                         columns: { columnVisibilityModel: { end_date: false } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    checkboxSelection
                    onRowSelectionModelChange={onSelectionChange}
                    rowSelectionModel={selectedBudgetIds}
                    disableRowSelectionOnClick
                    loading={isDeleting} // Show loading overlay during delete
                    localeText={dataGridLocale} // <-- Apply localization
                    sx={{
                        border: 'none',
                         '& .MuiDataGrid-row.Mui-selected': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        },
                        '& .MuiDataGrid-row.Mui-selected:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.12)',
                        },
                    }}
                />
            </CardContent>
        </Card>
    );
}
